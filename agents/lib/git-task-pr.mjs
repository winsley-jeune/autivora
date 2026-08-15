// Shared write-path for any executor agent (Uplift first, then CTR/Linker/Author) whose target
// is a repo file: one branch + one PR per task. This is the decided pattern, not a proposal —
// see agents/ARCHITECTURE.md § "Execution write-path". The reasoning: on headless Next.js,
// blog titles/metas/body content live in repo files (lib/blog-*.ts), not Shopify metafields, so
// git is the executor's only real "hands." Branching per task-id and putting Signal's evidence
// in the PR body turns git history into the audit log and rollback mechanism for free, and a
// PR-per-task gives the "draft → review → publish" guardrail with zero extra infrastructure —
// approve once via the GitHub PR review, no separate approval-queue system to build.
//
// Trust ramp (also decided, not yet implemented — the executor itself must apply it):
// auto-merge after one-click operator approval for the first two weeks per agent, then let that
// agent commit directly once it's earned trust. That ramp lives in the executor, not here — this
// module only opens the PR.
import { execFileSync } from "node:child_process";

// The actual deployed-from branch (confirmed with the operator 2026-07-26) — NOT necessarily
// whatever's checked out locally, and NOT left to gh's configured "default branch" setting.
// This repo keeps `master` and `main` in sync via the operator's own periodic merge PRs, and the
// two can and do diverge on the exact files executors edit (lib/blog-rewrites.ts) in between
// syncs. Hardcode the target; never infer it from local checkout state.
const PRODUCTION_BRANCH = "main";

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", ...opts }).trim();
}

export function branchNameForTask(task) {
  return `signal-task-${task.id}-${task.agent}`;
}

function prBody(task) {
  return [
    `Opened by the ${task.agent} agent for Signal task #${task.id}.`,
    "",
    `**Hypothesis:** ${task.hypothesis}`,
    `**Expected effect:** ${task.expected_effect}`,
    `**Check back on:** ${task.check_back_on}`,
    "",
    "**Evidence (from Signal):**",
    "```json",
    JSON.stringify(task.evidence ?? {}, null, 2),
    "```",
  ].join("\n");
}

// Refuses to start if any of `files` already has a pending change before the executor even
// began — that would mean the executor's edit gets bundled into the same commit as whatever
// unrelated work is sitting there, muddying both the diff and the attribution.
export function assertCleanFor(files, cwd) {
  const dirty = run("git", ["status", "--porcelain", "--", ...files], { cwd });
  if (dirty) {
    throw new Error(`openTaskPR: ${files.join(", ")} already has pending changes before this task started — resolve/commit them first:\n${dirty}`);
  }
}

// Call BEFORE the executor reads or edits any file — this is what makes the read consistent
// with the eventual PR base. Earlier versions of this module branched off whatever was locally
// checked out (often stale `master`) and only realized the mismatch at PR-open time, which meant
// an executor could generate an edit against content that didn't match production, or the
// branch-creation step could conflict outright. Fetches PRODUCTION_BRANCH, checks out a new task
// branch from origin/<PRODUCTION_BRANCH>'s tip (so whatever the executor reads off disk next is
// guaranteed to be production's current content), and returns the branch name to restore later.
export function startTaskBranch(task, cwd) {
  const startBranch = run("git", ["branch", "--show-current"], { cwd });
  run("git", ["fetch", "origin", PRODUCTION_BRANCH], { cwd });
  const branch = branchNameForTask(task);
  run("git", ["checkout", "-b", branch, `origin/${PRODUCTION_BRANCH}`], { cwd });
  return { startBranch, branch };
}

// Call AFTER the executor has made its edits on the branch startTaskBranch() created (working
// tree dirty with exactly `files` changed). Commits, pushes, opens a PR explicitly targeting
// PRODUCTION_BRANCH (never gh's implicit default), and returns to `startBranch` — success or
// failure. Returns the PR URL — pass it to completeTask() from agents/signal/lib/task-store.mjs.
export function finishTaskPR({ task, files, commitMessage, cwd, startBranch }) {
  if (!files?.length) throw new Error("finishTaskPR: no files given — refusing to commit an empty change");
  try {
    run("git", ["add", ...files], { cwd });
    run("git", ["commit", "-m", commitMessage ?? `${task.agent}: ${task.action} on ${task.target_url}`], { cwd });
    run("git", ["push", "-u", "origin", branchNameForTask(task)], { cwd });

    // Signal writes verbose multi-sentence `action` fields; GitHub caps PR titles at 256 chars
    // and rejects the whole create beyond it (bit tasks #26/#28: branch pushed, no PR). Keep
    // the title a summary; the full action already lives in the PR body.
    const rawTitle = `[${task.agent}] ${task.action} — ${task.target_url}`;
    const prTitle = rawTitle.length > 240 ? `[${task.agent}] task #${task.id} — ${task.target_url}`.slice(0, 240) : rawTitle;
    return run("gh", ["pr", "create", "--title", prTitle, "--body", prBody(task), "--head", branchNameForTask(task), "--base", PRODUCTION_BRANCH], { cwd });
  } finally {
    if (startBranch) run("git", ["checkout", startBranch], { cwd });
  }
}

// Deletes the local task branch after a failed run, so a retry via startTaskBranch() doesn't hit
// "branch already exists". Safe to call even if the branch was never created.
export function abandonTaskBranch(task, cwd) {
  try { run("git", ["branch", "-D", branchNameForTask(task)], { cwd }); } catch {}
}
