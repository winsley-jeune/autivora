#!/usr/bin/env node
// Uplift — strengthens the body content of one existing blog post per a Signal `uplift` task.
// The first specialist executor; see agents/ARCHITECTURE.md and agents/uplift/prompt.md.
//
// Usage:
//   node agents/uplift/run.mjs <taskId>              # claim, generate, write, typecheck, PR, complete
//   node agents/uplift/run.mjs <taskId> --dry-run     # call Claude only — no claim, no write, no git
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readEnv } from "../lib/env.mjs";
import { loadTasks, claimTask, completeTask, releaseTask } from "../signal/lib/task-store.mjs";
import { resolveArticle, resolveOriginalArticle, upsertRewriteEntry } from "../lib/blog-source.mjs";
import { callUplift } from "./lib/anthropic.mjs";
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

(async () => {
  if (!taskId) throw new Error("Usage: node agents/uplift/run.mjs <taskId> [--dry-run]");
  const { ANTHROPIC_API_KEY } = readEnv(["ANTHROPIC_API_KEY"]);
  const systemPrompt = readFileSync(join(__dir, "prompt.md"), "utf8");

  const store = loadTasks();
  const task = store.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error(`No task with id ${taskId}`);
  if (task.agent !== "uplift") throw new Error(`Task ${taskId} is agent=${task.agent}, not uplift`);
  if (task.status !== "open") throw new Error(`Task ${taskId} is status=${task.status}, not open`);

  if (!dryRun) assertCleanFor([REWRITES_PATH], ROOT);

  // Everything from here on — the Claude call, the file write, the branch/PR — is one unit of
  // work: if ANY of it fails (including the Claude call itself, before the task is even claimed),
  // we must get back to startBranch and remove the half-created task branch, or the operator is
  // left stranded on it (this bit us for real: a mid-flight API credit error left the shell
  // sitting on an orphaned task branch with no cleanup, since the old code only handled failures
  // that happened after claimTask()). `claimed` gates whether releaseTask() applies — a failure
  // before the task was ever claimed leaves it `open`, nothing to release.
  let startBranch = null;
  let taskBranch = null;
  let branchStarted = false;
  let claimed = false;

  try {
    if (!dryRun) {
      ({ startBranch, branch: taskBranch } = startTaskBranch(task, ROOT));
      branchStarted = true;
    }

    const slug = slugFromUrl(task.target_url);
    const resolved = resolveArticle(slug);
    if (!resolved) throw new Error(`Could not find article for slug "${slug}" (from ${task.target_url})`);

    // If an SEO rewrite replaced this page, the original may have been one of the sourced
    // competitor-research articles (real prices, cited against the competitor's own product
    // pages) — that data doesn't automatically carry over into the rewrite. Recover it as
    // mandatory grounding so Uplift pulls real numbers instead of estimating (see PR #13, closed
    // for fabricated Pura pricing — this is the fix). Only meaningful when hasOverride is true;
    // resolveOriginalArticle would just return the same content resolveArticle already did.
    const original = resolved.hasOverride ? resolveOriginalArticle(slug) : null;
    const competitorGrounding = original ? { source_file: original.sourceFile, article: original.article } : null;

    const catalog = JSON.parse(readFileSync(join(ROOT, "product-pipeline", "catalog-novelty.json"), "utf8"));
    const catalogSummary = catalog.products.map((p) => ({
      handle: p.handle, title: p.title, price: p.price, compare_at: p.compare_at, type: p.type, tags: p.tags,
    }));

    console.log(`Uplift: task #${taskId} → ${task.target_url} (slug: ${slug}, existing override: ${resolved.hasOverride}, competitor grounding: ${competitorGrounding ? `yes (${original.sourceFile})` : "no"})`);
    console.log("Uplift: calling Claude...");
    const { output, usage } = await callUplift({
      apiKey: ANTHROPIC_API_KEY,
      systemPrompt,
      task: { hypothesis: task.hypothesis, expected_effect: task.expected_effect, evidence: task.evidence, target_query: task.target_query },
      article: resolved.article,
      catalog: catalogSummary,
      competitorGrounding,
    });

    console.log(`\nchange_summary: ${output.change_summary}`);
    console.log(`content blocks: ${resolved.article.content.length} -> ${output.content.length}`);
    console.log(`usage: ${usage.input_tokens} in / ${usage.output_tokens} out / ${usage.cache_read_input_tokens} cache-read`);

    if (dryRun) {
      console.log("\n--dry-run: no claim, no file write, no git. Generated content:");
      output.content.forEach((block, i) => console.log(`\n[${i}] ${block.slice(0, 300)}${block.length > 300 ? "…" : ""}`));
      return;
    }

    await claimTask(taskId, "uplift-agent");
    claimed = true;
    console.log(`Uplift: claimed task #${taskId}.`);

    const updatedArticle = { ...resolved.article, content: output.content, readTime: output.read_time };
    upsertRewriteEntry(slug, updatedArticle);
    console.log(`Uplift: wrote ${REWRITES_PATH}.`);

    console.log("Uplift: typechecking (npx tsc --noEmit)...");
    const check = typecheck();
    if (!check.ok) {
      throw new Error(`tsc --noEmit failed:\n${check.output.slice(0, 2000)}`);
    }
    console.log("Uplift: typecheck passed.");

    const prUrl = finishTaskPR({
      task,
      files: [REWRITES_PATH],
      commitMessage: `uplift: ${task.action} on ${task.target_url}`,
      cwd: ROOT,
      startBranch,
      branch: taskBranch,
    });
    console.log(`Uplift: opened PR → ${prUrl}`);

    await completeTask(taskId, { prUrl, note: output.change_summary });
    console.log(`Uplift: task #${taskId} marked done. Check back on ${task.check_back_on}.`);
  } catch (e) {
    if (branchStarted) {
      try { git(["checkout", "--", REWRITES_PATH]); } catch {}
      try { git(["checkout", startBranch]); } catch {}
      abandonTaskBranch(task, ROOT, taskBranch);
    }
    if (claimed) {
      await releaseTask(taskId, e.message);
      console.error(`Uplift: FAILED, released task #${taskId} back to open.`);
    } else {
      console.error(`Uplift: FAILED before claiming task #${taskId} — task remains open.`);
    }
    throw e;
  }
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
