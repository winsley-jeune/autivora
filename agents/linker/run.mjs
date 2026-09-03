#!/usr/bin/env node
// Linker — inserts internal links into named source pages, pointing at one target page that
// needs inbound links, per a Signal `linker` task. See agents/ARCHITECTURE.md and
// agents/linker/prompt.md.
//
// Usage:
//   node agents/linker/run.mjs <taskId>              # claim, generate, write, typecheck, PR, complete
//   node agents/linker/run.mjs <taskId> --dry-run     # call Claude only — no claim, no write, no git
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readAiEnv } from "../lib/env.mjs";
import { loadTasks, claimTask, completeTask, releaseTask } from "../signal/lib/task-store.mjs";
import { resolveArticle, upsertRewriteEntry } from "../lib/blog-source.mjs";
import { callLinker } from "./lib/anthropic.mjs";
import { startTaskBranch, finishTaskPR, abandonTaskBranch, assertCleanFor } from "../lib/git-task-pr.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..");
const REWRITES_PATH = "lib/blog-rewrites.ts";
const args = process.argv.slice(2);
const taskId = Number(args.find((a) => /^\d+$/.test(a)));
const dryRun = args.includes("--dry-run");

const slugFromUrl = (url) => url.replace(/^\/blog\//, "").replace(/\/$/, "");

function git(cmdArgs) {
  return execFileSync("git", cmdArgs, { cwd: ROOT, encoding: "utf8" }).trim();
}

function typecheck() {
  try {
    execFileSync("npx", ["tsc", "--noEmit"], { cwd: ROOT, encoding: "utf8" });
    return { ok: true };
  } catch (e) {
    return { ok: false, output: (e.stdout ?? "") + (e.stderr ?? "") || e.message };
  }
}

// Every /blog/<slug> mentioned in the task's own text is a candidate source page — Signal
// already named them in prose (see agents/linker/prompt.md — the model decides which candidates
// actually apply and which the text excludes; this is just casting a wide-enough net).
function extractCandidateSlugs(task) {
  const text = `${task.action ?? ""} ${task.hypothesis ?? ""}`;
  const matches = [...text.matchAll(/\/blog\/([a-z0-9-]+)/g)].map((m) => m[1]);
  const targetSlug = slugFromUrl(task.target_url);
  return [...new Set(matches)].filter((slug) => slug !== targetSlug);
}

(async () => {
  if (!taskId) throw new Error("Usage: node agents/linker/run.mjs <taskId> [--dry-run]");
  const { ANTHROPIC_API_KEY } = readAiEnv();
  const systemPrompt = readFileSync(join(__dir, "prompt.md"), "utf8");

  const store = loadTasks();
  const task = store.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error(`No task with id ${taskId}`);
  if (task.agent !== "linker") throw new Error(`Task ${taskId} is agent=${task.agent}, not linker`);
  if (task.status !== "open") throw new Error(`Task ${taskId} is status=${task.status}, not open`);

  if (!dryRun) assertCleanFor([REWRITES_PATH], ROOT);

  // Everything from here on is one unit of work: if ANY of it fails — including the Claude call
  // itself, before the task is even claimed — we must get back to startBranch and remove the
  // half-created task branch, or the operator is left stranded on it (this happened for real: a
  // mid-flight API credit error left the shell sitting on an orphaned task branch with no
  // cleanup, since the old code only handled failures after claimTask()). `claimed` gates
  // whether releaseTask() applies — a failure before the task was ever claimed leaves it `open`.
  let startBranch = null;
  let taskBranch = null;
  let branchStarted = false;
  let claimed = false;

  try {
    if (!dryRun) {
      ({ startBranch, branch: taskBranch } = startTaskBranch(task, ROOT));
      branchStarted = true;
    }

    const candidateSlugs = extractCandidateSlugs(task);
    if (!candidateSlugs.length) throw new Error(`No /blog/<slug> candidates found in task ${taskId}'s action/hypothesis text`);

    const resolvedBySlug = new Map();
    const candidateSourcePages = [];
    for (const slug of candidateSlugs) {
      const resolved = resolveArticle(slug);
      if (!resolved) { console.warn(`Linker: candidate slug "${slug}" not found in blog data — skipping.`); continue; }
      resolvedBySlug.set(slug, resolved.article);
      candidateSourcePages.push({ slug, title: resolved.article.title, content: resolved.article.content });
    }
    if (!candidateSourcePages.length) throw new Error(`None of task ${taskId}'s candidate source pages (${candidateSlugs.join(", ")}) resolved to real articles`);

    console.log(`Linker: task #${taskId} → ${task.target_url}, ${candidateSourcePages.length} candidate source page(s): ${candidateSourcePages.map((p) => p.slug).join(", ")}`);
    console.log("Linker: calling configured AI model...");
    const { output, usage } = await callLinker({ apiKey: ANTHROPIC_API_KEY, systemPrompt, task, candidateSourcePages });

    console.log(`\nchange_summary: ${output.change_summary}`);
    console.log(`usage: ${usage.input_tokens} in / ${usage.output_tokens} out / ${usage.cache_read_input_tokens} cache-read`);
    console.log(`\nedits (${output.edits.length}):`);
    output.edits.forEach((e) => console.log(`  [${e.slug}] after block ${e.insert_after_index}: ${e.new_block.slice(0, 200)}${e.new_block.length > 200 ? "…" : ""}`));

    if (dryRun) {
      console.log("\n--dry-run: no claim, no file write, no git.");
      return;
    }

    const validEdits = output.edits.filter((e) => {
      if (!resolvedBySlug.has(e.slug)) { console.warn(`Linker: model referenced unknown slug "${e.slug}" — skipping that edit.`); return false; }
      return true;
    });
    if (!validEdits.length) throw new Error("No valid edits after filtering against candidate source pages");

    await claimTask(taskId, "linker-agent");
    claimed = true;
    console.log(`Linker: claimed task #${taskId}.`);

    for (const edit of validEdits) {
      const article = resolvedBySlug.get(edit.slug);
      const idx = Math.max(0, Math.min(edit.insert_after_index, article.content.length - 1));
      const newContent = [...article.content.slice(0, idx + 1), edit.new_block, ...article.content.slice(idx + 1)];
      upsertRewriteEntry(edit.slug, { ...article, content: newContent });
      console.log(`Linker: wrote link into ${edit.slug}.`);
    }

    console.log("Linker: typechecking (npx tsc --noEmit)...");
    const check = typecheck();
    if (!check.ok) {
      throw new Error(`tsc --noEmit failed:\n${check.output.slice(0, 2000)}`);
    }
    console.log("Linker: typecheck passed.");

    const prUrl = finishTaskPR({
      task,
      files: [REWRITES_PATH],
      commitMessage: `linker: ${task.action.slice(0, 72)}`,
      cwd: ROOT,
      startBranch,
      branch: taskBranch,
    });
    console.log(`Linker: opened PR → ${prUrl}`);

    await completeTask(taskId, { prUrl, note: output.change_summary });
    console.log(`Linker: task #${taskId} marked done. Check back on ${task.check_back_on}.`);
  } catch (e) {
    if (branchStarted) {
      try { git(["checkout", "--", REWRITES_PATH]); } catch {}
      try { git(["checkout", startBranch]); } catch {}
      abandonTaskBranch(task, ROOT, taskBranch);
    }
    if (claimed) {
      await releaseTask(taskId, e.message);
      console.error(`Linker: FAILED, released task #${taskId} back to open.`);
    } else {
      console.error(`Linker: FAILED before claiming task #${taskId} — task remains open.`);
    }
    throw e;
  }
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
