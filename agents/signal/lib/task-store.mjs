// Signal's task queue + decision history — the audit trail described in agents/ARCHITECTURE.md:
// every task carries the evidence that triggered it and a check-back date; Signal reads its own
// past check-backs to score whether interventions worked, which is how its judgment improves.
//
// SINGLE-WRITER RULE: this module is the only code allowed to mutate the task store. Every
// executor (Signal, CTR, Uplift, ...) must go through mutateTaskStore() — never loadTasks() +
// manual edit from outside this file. Persistence is a SQLite table in agents/state/agents.db
// (see agents/lib/db.mjs); a whole read-modify-write cycle runs inside one write transaction,
// so the lock files, tmp+rename dances, and lost-update windows of the old tasks.json are gone.
// Task documents stay schemaless JSON (the model emits evolving fields); id/status are real
// columns for queries and integrity.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { openDb, withTransaction, kvGet, kvSet, importLegacyJson } from "../../lib/db.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const LEGACY_PATH = join(__dir, "..", "state", "tasks.json");
const NEXT_ID_KEY = "signal.next_task_id";

// check_back_on offset per agent (also doubles as the re-targeting cooldown for that agent —
// don't re-touch a page you're still measuring the last change on). envoy/social have no
// defined cooldown: they target prospects/themes, not a single page, so collision risk is low.
export const CHECK_BACK_DAYS = { ctr: 14, uplift: 28, linker: 21, author: 35 };

let ready = false;
function ensureStore() {
  const d = openDb();
  if (ready) return d;
  d.exec(`
    CREATE TABLE IF NOT EXISTS signal_tasks (
      id     INTEGER PRIMARY KEY,
      status TEXT NOT NULL,
      doc    TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_signal_tasks_status ON signal_tasks(status);
  `);
  importLegacyJson("migrated.signal_tasks", LEGACY_PATH, (parsed) => persist(parsed));
  ready = true;
  return d;
}

function persist(store) {
  const d = openDb();
  d.prepare("DELETE FROM signal_tasks").run();
  const ins = d.prepare("INSERT INTO signal_tasks (id, status, doc) VALUES (?, ?, ?)");
  for (const t of store.tasks) ins.run(t.id, t.status, JSON.stringify(t));
  kvSet(NEXT_ID_KEY, store.nextId ?? (store.tasks.reduce((m, t) => Math.max(m, t.id), 0) + 1));
}

function materialize() {
  const d = ensureStore();
  const tasks = d.prepare("SELECT doc FROM signal_tasks ORDER BY id").all().map((r) => JSON.parse(r.doc));
  return { nextId: kvGet(NEXT_ID_KEY) ?? tasks.reduce((m, t) => Math.max(m, t.id), 0) + 1, tasks };
}

// The only sanctioned write path. `mutator(store)` may mutate `store` in place and/or return a
// replacement object; whichever comes back is what gets persisted. Returns whatever `mutator`
// returns, so callers can read back e.g. newly-assigned task IDs. The whole cycle is one
// SQLite write transaction.
export async function mutateTaskStore(mutator) {
  ensureStore();
  return withTransaction(async () => {
    const store = materialize();
    const result = await mutator(store);
    persist(result && typeof result === "object" && result.tasks ? result : store);
    return result;
  });
}

// Read-only snapshot — safe to call without a transaction since nothing here writes.
export function loadTasks() {
  ensureStore();
  return materialize();
}

export function openTasks(store) {
  // Anything not yet scored counts as "active" for dedup + cooldown purposes — a `done` task
  // (executed, awaiting its check-back) still occupies its target until Signal scores it.
  return store.tasks.filter((t) => t.status === "open" || t.status === "in_progress" || t.status === "done");
}

export function checkbacksDue(store, today = new Date()) {
  const todayStr = today.toISOString().slice(0, 10);
  return store.tasks.filter((t) => t.status === "done" && t.check_back_on && t.check_back_on <= todayStr);
}

export function outcomeHistory(store, limit = 50) {
  return store.tasks
    .filter((t) => t.status === "scored")
    .sort((a, b) => (b.scored_at ?? "").localeCompare(a.scored_at ?? ""))
    .slice(0, limit);
}

export function meanByAction(history) {
  const byAction = {};
  for (const t of history) {
    const key = t.action || t.agent;
    if (!byAction[key]) byAction[key] = { sum: 0, count: 0 };
    byAction[key].sum += t.outcome_score ?? 0;
    byAction[key].count += 1;
  }
  return Object.fromEntries(
    Object.entries(byAction).map(([k, v]) => [k, { mean: Number((v.sum / v.count).toFixed(3)), count: v.count }])
  );
}

// True if `agent` already touched `targetUrl` within its cooldown window (created_at, not
// completion — the clock starts when the task was queued). Enforced in code (run.mjs), not
// left to the model to remember from `open_tasks` — the same "code disposes" guardrail the
// architecture applies to spend.
export function isOnCooldown(store, targetUrl, agent, today = new Date()) {
  const days = CHECK_BACK_DAYS[agent];
  if (!days) return false; // no defined cooldown for this agent type (envoy/social)
  const cutoff = new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  // Expired tasks never actually touched the page — nothing to cool down from.
  return store.tasks.some(
    (t) => t.agent === agent && t.target_url === targetUrl && t.status !== "expired" && t.created_at >= cutoff
  );
}

// Applies Signal's checkback_scores output: marks matching `done` tasks as scored.
export function applyCheckbackScores(store, scores, scoredAt) {
  for (const s of scores || []) {
    const task = store.tasks.find((t) => t.id === s.task_id);
    if (!task) continue;
    task.status = "scored";
    task.outcome_score = s.outcome_score;
    task.outcome_notes = s.outcome_notes;
    task.scored_at = scoredAt;
  }
  return store;
}

// Appends Signal's newly emitted tasks, assigning sequential IDs. Tasks start `open` — an
// executor claims them (status -> in_progress -> done); Signal never sets those itself.
export function appendTasks(store, tasks, createdAt) {
  for (const t of tasks || []) {
    store.tasks.push({ id: store.nextId++, status: "open", created_at: createdAt, ...t });
  }
  return store;
}

// Until an executor exists for a given agent type, every task Signal emits sits `open` forever
// — never scored (checkbacksDue only matches `done`), and never released from openTasks'
// dedup/cooldown check. That silently starves every lane behind a growing pile of stale opens.
// Expired tasks don't feed outcome_history (they're not `scored`) — there's no outcome to learn
// from an unclaimed task, only a gap in execution capacity.
// 14, not 7: with no executor built yet, a 7-day default would expire the first couple weeks
// of tasks before anything exists to claim them. Revisit downward once an executor is running
// and actually claiming tasks same-day/next-day.
export function expireStaleTasks(store, nowISO, maxOpenDays = 14) {
  const cutoff = new Date(Date.parse(nowISO) - maxOpenDays * 24 * 60 * 60 * 1000).toISOString();
  for (const t of store.tasks) {
    if (t.status === "open" && t.created_at < cutoff) {
      t.status = "expired";
      t.expired_at = nowISO;
      t.outcome_notes = "expired unclaimed — no executor picked this up in time";
    }
  }
  return store;
}

// --- Executor-facing helpers (for CTR/Uplift/Linker/etc. — not used by Signal itself) ---
// Both go through mutateTaskStore, so an executor never needs to hand-write a read-modify-write
// against the store. See agents/lib/git-task-pr.mjs for the paired git write-path helper.

export async function claimTask(taskId, executorName) {
  return mutateTaskStore((store) => {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`No task with id ${taskId}`);
    if (task.status !== "open") throw new Error(`Task ${taskId} is not open (status: ${task.status})`);
    task.status = "in_progress";
    task.claimed_by = executorName;
    task.claimed_at = new Date().toISOString();
    return store;
  });
}

// Reverts a claimed task back to `open` on executor failure (Claude call errored, typecheck
// failed, git push failed, ...) so it's retryable instead of stuck `in_progress` forever with
// nothing able to touch it again (claimTask() only accepts `open`).
export async function releaseTask(taskId, reason) {
  return mutateTaskStore((store) => {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`No task with id ${taskId}`);
    task.status = "open";
    task.release_notes = [...(task.release_notes ?? []), { at: new Date().toISOString(), reason }];
    delete task.claimed_by;
    delete task.claimed_at;
    return store;
  });
}

export async function completeTask(taskId, { prUrl, commitSha, note } = {}) {
  return mutateTaskStore((store) => {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`No task with id ${taskId}`);
    if (task.status !== "in_progress") throw new Error(`Task ${taskId} is not in_progress (status: ${task.status})`);
    task.status = "done";
    task.completed_at = new Date().toISOString();
    if (prUrl) task.pr_url = prUrl;
    if (commitSha) task.commit_sha = commitSha;
    if (note) task.completion_note = note;
    return store;
  });
}
