// The agent fleet's shared state database — agents/state/agents.db, SQLite via node:sqlite
// (same engine choice as agents/dropship/lib/observatory.mjs, which predates this and stays
// separate because it holds millions of snapshot rows with its own lifecycle).
//
// Standing rule (operator, 2026-08-09): agent state lives in a database, never in JSON files.
// JSON-file stores needed hand-rolled lock files, tmp+rename atomic writes, and still had
// lost-update windows between processes; SQLite gives all of that for free via transactions.
// WAL + busy_timeout means concurrent agents queue briefly instead of corrupting or clobbering.
//
// Report artifacts (output/*-latest.json digests for the operator) are NOT state and stay as
// files; operator-authored inputs (e.g. signal/state/pricing-experiments.json) also stay files.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, existsSync, renameSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DB_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "state", "agents.db");

let db = null;
export function openDb() {
  if (db) return db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 10000;
    PRAGMA synchronous = NORMAL;
    CREATE TABLE IF NOT EXISTS kv (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL
    ) WITHOUT ROWID;
  `);
  return db;
}

// Runs fn inside a write transaction. BEGIN IMMEDIATE takes the write lock up front so a
// concurrent writer blocks here (up to busy_timeout) instead of failing at COMMIT. fn may be
// async (some mutators await model calls today); the lock is held across the await, which
// mirrors the old file-lock semantics.
export async function withTransaction(fn) {
  const d = openDb();
  d.exec("BEGIN IMMEDIATE");
  try {
    const result = await fn(d);
    d.exec("COMMIT");
    return result;
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}

// Synchronous variant for callers whose mutation is pure computation (no awaits inside).
export function transactionSync(fn) {
  const d = openDb();
  d.exec("BEGIN IMMEDIATE");
  try {
    const result = fn(d);
    d.exec("COMMIT");
    return result;
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}

export function kvGet(key) {
  const row = openDb().prepare("SELECT value FROM kv WHERE key = ?").get(key);
  return row ? JSON.parse(row.value) : null;
}

export function kvSet(key, value) {
  openDb()
    .prepare("INSERT INTO kv (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at")
    .run(key, JSON.stringify(value), new Date().toISOString());
}

// One-time legacy import: if the marker key is absent and the legacy JSON file exists, parse
// it, hand it to `importer`, and rename the file to *.migrated so it can never be re-imported
// (kept on disk as a backup rather than deleted). Runs inside the caller's setup, not as a
// separate migration script, so a fresh checkout and a legacy checkout both just work.
export function importLegacyJson(markerKey, legacyPath, importer) {
  if (kvGet(markerKey)) return;
  if (existsSync(legacyPath)) {
    const parsed = JSON.parse(readFileSync(legacyPath, "utf8"));
    importer(parsed);
    renameSync(legacyPath, `${legacyPath}.migrated`);
  }
  kvSet(markerKey, { migratedAt: new Date().toISOString() });
}
