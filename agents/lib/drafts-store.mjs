// The operator approval queue — one table for every agent that drafts outbound content
// (herald: social posts, envoy: outreach pitches). Replaces herald/state/post-queue.json and
// envoy/state/outreach-queue.json, which agents rewrote wholesale while the operator hand-
// edited statuses in the same file — a lost-update by construction. Here agents only INSERT
// new drafts and the operator flips status via `npm run queue` (agents/scripts/queue.mjs),
// so the two writers can no longer clobber each other.
//
// Draft lifecycle: needs_approval -> approved -> posted, or -> obsolete. Agents treat
// needs_approval/approved as "unposted" for their queue-target math and never set the
// posted/obsolete states themselves — publishing stays a human act.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { openDb, importLegacyJson } from "./db.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));

let ready = false;
function ensureStore() {
  const d = openDb();
  if (ready) return d;
  d.exec(`
    CREATE TABLE IF NOT EXISTS drafts (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      agent     TEXT NOT NULL,
      status    TEXT NOT NULL,
      queued_on TEXT NOT NULL,
      doc       TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_drafts_agent_status ON drafts(agent, status);
  `);
  importLegacyJson("migrated.herald_drafts", join(__dir, "..", "herald", "state", "post-queue.json"), (parsed) => insertRows("herald", parsed));
  importLegacyJson("migrated.envoy_drafts", join(__dir, "..", "envoy", "state", "outreach-queue.json"), (parsed) => insertRows("envoy", parsed));
  ready = true;
  return d;
}

function insertRows(agent, entries) {
  const ins = openDb().prepare("INSERT INTO drafts (agent, status, queued_on, doc) VALUES (?, ?, ?, ?)");
  for (const e of entries) ins.run(agent, e.status ?? "needs_approval", e.queuedOn ?? "", JSON.stringify(e));
}

export function listDrafts(agent, { status } = {}) {
  const d = ensureStore();
  const rows = status
    ? d.prepare("SELECT id, agent, status, queued_on, doc FROM drafts WHERE agent = ? AND status = ? ORDER BY id").all(agent, status)
    : d.prepare("SELECT id, agent, status, queued_on, doc FROM drafts WHERE agent = ? ORDER BY id").all(agent);
  return rows.map((r) => ({ ...JSON.parse(r.doc), id: r.id, agent: r.agent, status: r.status, queuedOn: r.queued_on }));
}

export function addDrafts(agent, entries) {
  ensureStore();
  insertRows(agent, entries);
}

export function countUnposted(agent) {
  const d = ensureStore();
  return d.prepare("SELECT COUNT(*) n FROM drafts WHERE agent = ? AND status IN ('needs_approval', 'approved')").get(agent).n;
}

// Operator-facing (via agents/scripts/queue.mjs) — the doc's own status field is updated too
// so exports/digests never show a stale inner status.
export function markDraft(id, status, note) {
  const d = ensureStore();
  const row = d.prepare("SELECT doc FROM drafts WHERE id = ?").get(id);
  if (!row) throw new Error(`No draft with id ${id}`);
  const doc = JSON.parse(row.doc);
  doc.status = status;
  if (note) doc.statusNote = note;
  d.prepare("UPDATE drafts SET status = ?, doc = ? WHERE id = ?").run(status, JSON.stringify(doc), id);
  return doc;
}
