// Signal's task queue + decision history — the audit trail described in agents/ARCHITECTURE.md:
// every task carries the evidence that triggered it and a check-back date; Signal reads its own
// past check-backs to score whether interventions worked, which is how its judgment improves.
//
// SINGLE-WRITER RULE: this module is the only code allowed to mutate state/tasks.json. Every
// executor (Signal, CTR, Uplift, ...) must go through mutateTaskStore() — never loadTasks() +
// manual edit + saveTasks() from outside this file. Once more than one process can read-modify-
// write the same file, an unguarded read-modify-write is a lost-update bug waiting to happen
// (task A claims a task, task B's stale read overwrites A's claim, the task silently reverts to
// "open" and runs twice). mutateTaskStore() takes a filesystem lock around the whole
// read-modify-write cycle and writes atomically (temp file + rename) so a crash mid-write can't
// corrupt the store.
import { readFileSync, writeFileSync, mkdirSync, existsSync, openSync, closeSync, unlinkSync, statSync, renameSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const STORE_PATH = join(__dir, "..", "state", "tasks.json");
const LOCK_PATH = join(__dir, "..", "state", "tasks.lock");
const LOCK_STALE_MS = 60_000; // a lock older than this is assumed to belong to a crashed process
const LOCK_RETRY_MS = 100;
const LOCK_TIMEOUT_MS = 10_000;

// check_back_on offset per agent (also doubles as the re-targeting cooldown for that agent —
// don't re-touch a page you're still measuring the last change on). envoy/social have no
// defined cooldown: they target prospects/themes, not a single page, so collision risk is low.
export const CHECK_BACK_DAYS = { ctr: 14, uplift: 28, linker: 21, author: 35 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function acquireLock() {
  mkdirSync(dirname(LOCK_PATH), { recursive: true });
  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  for (;;) {
    try {
      closeSync(openSync(LOCK_PATH, "wx"));
      return;
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
      const age = (() => { try { return Date.now() - statSync(LOCK_PATH).mtimeMs; } catch { return Infinity; } })();
      if (age > LOCK_STALE_MS) { try { unlinkSync(LOCK_PATH); } catch {} continue; }
      if (Date.now() > deadline) throw new Error("tasks.json lock timed out — a previous run may have crashed while holding it. Check agents/signal/state/tasks.lock.");
      await sleep(LOCK_RETRY_MS);
    }
  }
}

function releaseLock() {
  try { unlinkSync(LOCK_PATH); } catch {}
}

function empty() {
  return { nextId: 1, tasks: [] };
}

function readStoreFile() {
  if (!existsSync(STORE_PATH)) return empty();
  return JSON.parse(readFileSync(STORE_PATH, "utf8"));
}

function writeStoreFileAtomic(store) {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  const tmpPath = `${STORE_PATH}.tmp-${process.pid}`;
  writeFileSync(tmpPath, JSON.stringify(store, null, 2));
  renameSync(tmpPath, STORE_PATH);
}

// The only sanctioned write path. `mutator(store)` may mutate `store` in place and/or return a
// replacement object; whichever comes back is what gets persisted. Returns whatever `mutator`
// returns, so callers can read back e.g. newly-assigned task IDs.
export async function mutateTaskStore(mutator) {
  await acquireLock();
  try {
    const store = readStoreFile();
    const result = await mutator(store);
    writeStoreFileAtomic(result && typeof result === "object" && result.tasks ? result : store);
    return result;
  } finally {
    releaseLock();
  }
}

// Read-only snapshot — safe to call without the lock since nothing here writes.
export function loadTasks() {
  return readStoreFile();
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
// against tasks.json. See agents/lib/git-task-pr.mjs for the paired git write-path helper.

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
