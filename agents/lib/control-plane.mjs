// Durable execution control for autonomous agents. This module owns workflow leases and external
// side-effect idempotency. A model may propose work, but it cannot bypass these state transitions.
import { randomUUID } from "node:crypto";
import { openDb, transactionSync } from "./db.mjs";

let ready = false;
function ensureControlPlane() {
  const d = openDb();
  if (ready) return d;
  d.exec(`
    CREATE TABLE IF NOT EXISTS workflow_runs (
      id               TEXT PRIMARY KEY,
      workflow         TEXT NOT NULL,
      run_key          TEXT NOT NULL,
      status           TEXT NOT NULL CHECK(status IN ('running','complete','failed')),
      started_at       TEXT NOT NULL,
      lease_expires_at TEXT NOT NULL,
      completed_at     TEXT,
      error            TEXT,
      UNIQUE(workflow, run_key)
    );
    CREATE INDEX IF NOT EXISTS idx_workflow_runs_status_lease
      ON workflow_runs(status, lease_expires_at);

    CREATE TABLE IF NOT EXISTS operations (
      id               TEXT PRIMARY KEY,
      operation_key    TEXT NOT NULL UNIQUE,
      kind             TEXT NOT NULL,
      status           TEXT NOT NULL CHECK(status IN ('reserved','complete','failed')),
      request           TEXT NOT NULL,
      result            TEXT,
      reserved_at      TEXT NOT NULL,
      lease_expires_at TEXT NOT NULL,
      completed_at     TEXT,
      attempts         INTEGER NOT NULL DEFAULT 1,
      error            TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_operations_status_lease
      ON operations(status, lease_expires_at);
  `);
  ready = true;
  return d;
}

const plusMs = (iso, ms) => new Date(Date.parse(iso) + ms).toISOString();

export function acquireWorkflowLease({ workflow, runKey, leaseMs = 60 * 60 * 1000, force = false, now = new Date() }) {
  ensureControlPlane();
  return transactionSync((d) => {
    const nowISO = now.toISOString();
    const existing = d.prepare("SELECT * FROM workflow_runs WHERE workflow = ? AND run_key = ?").get(workflow, runKey);
    if (existing && !force) {
      if (existing.status === "complete") return { acquired: false, reason: "complete", run: existing };
      if (existing.status === "running" && existing.lease_expires_at > nowISO) {
        return { acquired: false, reason: "running", run: existing };
      }
    }

    const id = randomUUID();
    d.prepare(`
      INSERT INTO workflow_runs (id, workflow, run_key, status, started_at, lease_expires_at)
      VALUES (?, ?, ?, 'running', ?, ?)
      ON CONFLICT(workflow, run_key) DO UPDATE SET
        id = excluded.id, status = 'running', started_at = excluded.started_at,
        lease_expires_at = excluded.lease_expires_at, completed_at = NULL, error = NULL
    `).run(id, workflow, runKey, nowISO, plusMs(nowISO, leaseMs));
    return { acquired: true, run: d.prepare("SELECT * FROM workflow_runs WHERE id = ?").get(id) };
  });
}

export function finishWorkflow(runId, { status = "complete", error = null, now = new Date() } = {}) {
  if (!['complete', 'failed'].includes(status)) throw new Error(`Invalid workflow terminal status: ${status}`);
  const result = ensureControlPlane().prepare(`
    UPDATE workflow_runs SET status = ?, completed_at = ?, error = ?
    WHERE id = ? AND status = 'running'
  `).run(status, now.toISOString(), error ? String(error).slice(0, 2000) : null, runId);
  if (result.changes !== 1) throw new Error(`Workflow run ${runId} is missing or no longer running`);
}

// Reserve before an external POST. A completed operation returns its prior result, making retries
// safe. An unexpired reservation blocks another worker. An expired/failed reservation is reclaimed.
export function reserveOperation({ operationKey, kind, request, leaseMs = 10 * 60 * 1000, now = new Date() }) {
  ensureControlPlane();
  return transactionSync((d) => {
    const nowISO = now.toISOString();
    const existing = d.prepare("SELECT * FROM operations WHERE operation_key = ?").get(operationKey);
    if (existing?.status === "complete") {
      return { reserved: false, reason: "complete", operation: existing, result: JSON.parse(existing.result) };
    }
    if (existing?.status === "reserved" && existing.lease_expires_at > nowISO) {
      return { reserved: false, reason: "in_progress", operation: existing };
    }

    const id = existing?.id ?? randomUUID();
    d.prepare(`
      INSERT INTO operations (id, operation_key, kind, status, request, reserved_at, lease_expires_at, attempts)
      VALUES (?, ?, ?, 'reserved', ?, ?, ?, 1)
      ON CONFLICT(operation_key) DO UPDATE SET
        kind = excluded.kind, status = 'reserved', request = excluded.request,
        reserved_at = excluded.reserved_at, lease_expires_at = excluded.lease_expires_at,
        completed_at = NULL, error = NULL, attempts = operations.attempts + 1
    `).run(id, operationKey, kind, JSON.stringify(request), nowISO, plusMs(nowISO, leaseMs));
    return { reserved: true, operation: d.prepare("SELECT * FROM operations WHERE id = ?").get(id) };
  });
}

export function completeOperation(operationId, result, now = new Date()) {
  const update = ensureControlPlane().prepare(`
    UPDATE operations SET status = 'complete', result = ?, completed_at = ?, error = NULL
    WHERE id = ? AND status = 'reserved'
  `).run(JSON.stringify(result), now.toISOString(), operationId);
  if (update.changes !== 1) throw new Error(`Operation ${operationId} is missing or no longer reserved`);
}

export function failOperation(operationId, error, now = new Date()) {
  const update = ensureControlPlane().prepare(`
    UPDATE operations SET status = 'failed', completed_at = ?, error = ?
    WHERE id = ? AND status = 'reserved'
  `).run(now.toISOString(), String(error).slice(0, 2000), operationId);
  if (update.changes !== 1) throw new Error(`Operation ${operationId} is missing or no longer reserved`);
}
