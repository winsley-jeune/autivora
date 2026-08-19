// Independent automated approval records. The verifier must differ from the producer; only a
// passing terminal result may be consumed by a publisher.
import { randomUUID } from "node:crypto";
import { openDb } from "./db.mjs";

let ready = false;
function ensure() {
  const d = openDb();
  if (ready) return d;
  d.exec(`CREATE TABLE IF NOT EXISTS verification_results (
    id TEXT PRIMARY KEY,
    artifact_key TEXT NOT NULL,
    artifact_hash TEXT NOT NULL,
    producer TEXT NOT NULL,
    verifier TEXT NOT NULL,
    kind TEXT NOT NULL,
    passed INTEGER NOT NULL CHECK(passed IN (0,1)),
    checks TEXT NOT NULL,
    notes TEXT,
    verified_at TEXT NOT NULL,
    UNIQUE(artifact_key, artifact_hash, verifier, kind)
  );`);
  ready = true;
  return d;
}

export function recordVerification({ artifactKey, artifactHash, producer, verifier, kind, passed, checks, notes = null }) {
  if (!artifactKey || !artifactHash || !producer || !verifier || !kind) throw new Error("Incomplete verification identity");
  if (producer === verifier) throw new Error("Producer cannot verify its own artifact");
  if (!checks || typeof checks !== "object") throw new Error("Verification checks are required");
  const id = randomUUID();
  ensure().prepare(`INSERT INTO verification_results(id,artifact_key,artifact_hash,producer,verifier,kind,passed,checks,notes,verified_at)
    VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(artifact_key,artifact_hash,verifier,kind) DO UPDATE SET
    passed=excluded.passed,checks=excluded.checks,notes=excluded.notes,verified_at=excluded.verified_at`)
    .run(id, artifactKey, artifactHash, producer, verifier, kind, passed ? 1 : 0, JSON.stringify(checks), notes, new Date().toISOString());
  return latestVerification({ artifactKey, artifactHash, kind });
}

export function latestVerification({ artifactKey, artifactHash, kind }) {
  const row = ensure().prepare(`SELECT * FROM verification_results WHERE artifact_key=? AND artifact_hash=? AND kind=? ORDER BY verified_at DESC, rowid DESC LIMIT 1`)
    .get(artifactKey, artifactHash, kind);
  return row ? { ...row, passed: Boolean(row.passed), checks: JSON.parse(row.checks) } : null;
}

export function requirePassingVerification(args) {
  const result = latestVerification(args);
  if (!result?.passed) throw new Error(`Artifact ${args.artifactKey} lacks passing independent ${args.kind} verification`);
  return result;
}
