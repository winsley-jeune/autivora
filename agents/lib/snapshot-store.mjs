// Dated analytics snapshot archive — written by agents/analytics/run.mjs, read by Signal's
// checkback scoring (agents/signal/lib/snapshot-history.mjs). One row per calendar day;
// re-running the same day upserts that day's row, which is fine — it's still that day's true
// state. Replaces the output/history/snapshot-YYYY-MM-DD.json file-per-day archive (auto-
// imported on first open; the old directory is renamed *.migrated as a backup).
// snapshot-latest.json stays a file: it's the current-run report handoff, not history.
import { readdirSync, readFileSync, existsSync, renameSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { openDb, kvGet, kvSet } from "./db.mjs";

const LEGACY_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "analytics", "output", "history");

let ready = false;
function ensureStore() {
  const d = openDb();
  if (ready) return d;
  d.exec(`
    CREATE TABLE IF NOT EXISTS analytics_snapshots (
      day TEXT PRIMARY KEY,
      doc TEXT NOT NULL
    ) WITHOUT ROWID;
  `);
  if (!kvGet("migrated.analytics_snapshots")) {
    if (existsSync(LEGACY_DIR)) {
      const ins = d.prepare("INSERT OR REPLACE INTO analytics_snapshots (day, doc) VALUES (?, ?)");
      for (const f of readdirSync(LEGACY_DIR)) {
        const m = f.match(/^snapshot-(\d{4}-\d{2}-\d{2})\.json$/);
        if (m) ins.run(m[1], readFileSync(join(LEGACY_DIR, f), "utf8"));
      }
      renameSync(LEGACY_DIR, `${LEGACY_DIR}.migrated`);
    }
    kvSet("migrated.analytics_snapshots", { migratedAt: new Date().toISOString() });
  }
  ready = true;
  return d;
}

export function recordSnapshot(day, snapshot) {
  ensureStore()
    .prepare("INSERT OR REPLACE INTO analytics_snapshots (day, doc) VALUES (?, ?)")
    .run(day, JSON.stringify(snapshot));
}

export function snapshotDates() {
  return ensureStore().prepare("SELECT day FROM analytics_snapshots ORDER BY day").all().map((r) => r.day);
}

export function loadSnapshot(day) {
  const row = ensureStore().prepare("SELECT doc FROM analytics_snapshots WHERE day = ?").get(day);
  return row ? JSON.parse(row.doc) : null;
}
