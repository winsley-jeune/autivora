// Durable, normalized evidence observations. Reports may still be exported as JSON for humans,
// but agents should reason from records that carry an observation horizon, freshness policy,
// and explicit completeness state.
import { randomUUID } from "node:crypto";
import { openDb, transactionSync } from "./db.mjs";

let ready = false;
function ensure() {
  const d = openDb();
  if (ready) return d;
  d.exec(`
    CREATE TABLE IF NOT EXISTS evidence (
      id               TEXT PRIMARY KEY,
      evidence_key     TEXT NOT NULL UNIQUE,
      source           TEXT NOT NULL,
      kind             TEXT NOT NULL,
      observed_at      TEXT NOT NULL,
      data_through     TEXT,
      recorded_at      TEXT NOT NULL,
      expires_at       TEXT NOT NULL,
      complete         INTEGER NOT NULL CHECK(complete IN (0,1)),
      completeness     TEXT NOT NULL,
      payload          TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_evidence_source_observed
      ON evidence(source, observed_at DESC);
    CREATE INDEX IF NOT EXISTS idx_evidence_expiry ON evidence(expires_at);
  `);
  ready = true;
  return d;
}

function iso(value, field) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid evidence ${field}`);
  return date.toISOString();
}

function decode(row, now = new Date()) {
  if (!row) return null;
  return {
    ...row,
    complete: Boolean(row.complete),
    stale: row.expires_at <= now.toISOString(),
    completeness: JSON.parse(row.completeness),
    payload: JSON.parse(row.payload),
  };
}

export function recordEvidence({
  evidenceKey,
  source,
  kind,
  observedAt = new Date(),
  dataThrough = null,
  maxAgeMs,
  complete,
  completeness = {},
  payload,
  recordedAt = new Date(),
}) {
  if (!evidenceKey || !source || !kind) throw new Error("Evidence requires evidenceKey, source, and kind");
  if (!Number.isFinite(maxAgeMs) || maxAgeMs <= 0) throw new Error("Evidence requires a positive maxAgeMs");
  if (typeof complete !== "boolean") throw new Error("Evidence completeness must be boolean");
  if (payload === undefined) throw new Error("Evidence payload is required");

  const observedISO = iso(observedAt, "observedAt");
  const recordedISO = iso(recordedAt, "recordedAt");
  const expiresISO = new Date(Date.parse(observedISO) + maxAgeMs).toISOString();
  const dataThroughValue = dataThrough ? iso(dataThrough, "dataThrough") : null;
  const id = randomUUID();

  return transactionSync((d) => {
    ensure();
    d.prepare(`INSERT INTO evidence(
      id,evidence_key,source,kind,observed_at,data_through,recorded_at,expires_at,complete,completeness,payload
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(evidence_key) DO UPDATE SET
      source=excluded.source,kind=excluded.kind,observed_at=excluded.observed_at,
      data_through=excluded.data_through,recorded_at=excluded.recorded_at,
      expires_at=excluded.expires_at,complete=excluded.complete,
      completeness=excluded.completeness,payload=excluded.payload`)
      .run(id, evidenceKey, source, kind, observedISO, dataThroughValue, recordedISO,
        expiresISO, complete ? 1 : 0, JSON.stringify(completeness), JSON.stringify(payload));
    return getEvidence(evidenceKey, { now: recordedAt });
  });
}

export function getEvidence(evidenceKey, { now = new Date() } = {}) {
  return decode(ensure().prepare("SELECT * FROM evidence WHERE evidence_key = ?").get(evidenceKey), now);
}

export function latestEvidence(source, kind, { now = new Date(), requireComplete = false, requireFresh = false } = {}) {
  const row = ensure().prepare(`SELECT * FROM evidence WHERE source = ? AND kind = ?
    ${requireComplete ? "AND complete = 1" : ""} ORDER BY observed_at DESC, recorded_at DESC LIMIT 1`).get(source, kind);
  const result = decode(row, now);
  if (requireFresh && result?.stale) return null;
  return result;
}

export function requireUsableEvidence(source, kind, options = {}) {
  const result = latestEvidence(source, kind, { ...options, requireComplete: true, requireFresh: true });
  if (!result) throw new Error(`No complete, fresh ${source}/${kind} evidence is available`);
  return result;
}
