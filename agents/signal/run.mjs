#!/usr/bin/env node
// Signal — the analyst agent's daily decision entry point. Reads the analytics snapshot +
// Signal's own task history, asks Claude to score past decisions and emit today's prioritized
// task list, then persists both. Read-only against the live store — it queues tasks for the
// specialist agents (ctr/uplift/linker/envoy/author/social) to execute; it never publishes
// anything itself. See agents/ARCHITECTURE.md and agents/signal/prompt.md.
//
// Usage:
//   node agents/signal/run.mjs [--skip-crawl] [--dry-run] [--force]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readEnv } from "../analytics/lib/env.mjs";
import { buildInputs } from "./lib/inputs.mjs";
import { callSignal } from "./lib/anthropic.mjs";
import { mutateTaskStore, applyCheckbackScores, appendTasks, isOnCooldown, expireStaleTasks } from "./lib/task-store.mjs";
import { updateQueryHistory, saveQueryHistory } from "./lib/query-history.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const skipCrawl = args.includes("--skip-crawl");
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");

// Operator policy, enforced here in code — not left to the prompt to remember. Keep in sync
// with the hard rules in prompt.md; see agents/signal/README.md.
const CAPS = { total: 8, ctr: 3, uplift: 2, linker: 2, author: 1 };

// Applies total/per-agent caps, the author gate, and per-page cooldowns (don't re-touch a page
// whose metric change you're still measuring). `store` is the pre-call snapshot — good enough
// for this check; the final persisted write re-reads fresh under lock in mutateTaskStore.
function enforceCaps(tasks, { authorGateMet, store, now }) {
  const counts = {};
  const kept = [];
  const dropped = [];
  for (const t of tasks) {
    if (kept.length >= CAPS.total) { dropped.push({ task: t, reason: "total cap" }); continue; }
    if (t.agent === "author" && !authorGateMet) { dropped.push({ task: t, reason: "author gate not met" }); continue; }
    if (isOnCooldown(store, t.target_url, t.agent, now)) { dropped.push({ task: t, reason: "page cooldown" }); continue; }
    const cap = CAPS[t.agent];
    counts[t.agent] = (counts[t.agent] ?? 0) + 1;
    if (cap && counts[t.agent] > cap) { dropped.push({ task: t, reason: `${t.agent} cap` }); continue; }
    kept.push(t);
  }
  return { kept, dropped };
}

(async () => {
  const { ANTHROPIC_API_KEY } = readEnv(["ANTHROPIC_API_KEY"]);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://autivara.com";
  const systemPrompt = readFileSync(join(__dir, "prompt.md"), "utf8");

  console.log("Signal: building inputs...");
  const inputs = await buildInputs({ baseUrl, skipCrawl });
  const { _store: store, _searchConsoleQueries, ...promptInputs } = inputs;

  console.log(
    `Signal: ${promptInputs.ctr_candidates.length} ctr candidates, ${promptInputs.uplift_candidates.length} uplift candidates, ` +
    `${promptInputs.new_queries.length} new queries, ${promptInputs.open_tasks.length} open tasks, ${promptInputs.checkbacks_due.length} checkbacks due.`
  );

  // One decision batch per day. Caps in enforceCaps() are per-*run*, not per-day — without this,
  // a second real run the same day (you re-running it, a cron/manual overlap, a second session)
  // doesn't get blocked, it just steers around the first run's targets and picks from an
  // increasingly picked-over candidate list, quietly inflating the queue with lower-priority
  // tasks and paying for an extra Opus call each time. Checked before the Claude call, not after,
  // so a same-day re-run costs nothing.
  const todayStr = new Date().toISOString().slice(0, 10);
  const ranToday = store.tasks.some((t) => t.created_at.slice(0, 10) === todayStr);
  if (ranToday && !dryRun && !force) {
    console.log(`Signal: already emitted tasks today (${todayStr}) — one decision batch per day. Use --dry-run to preview or --force to override.`);
    return;
  }

  console.log("Signal: calling Claude...");
  const { output, usage } = await callSignal({ apiKey: ANTHROPIC_API_KEY, systemPrompt, userInput: promptInputs });

  const now = new Date();
  const nowISO = now.toISOString();
  const { kept, dropped } = enforceCaps(output.tasks || [], { authorGateMet: promptInputs.strategic_state.author_gate_met, store, now });
  if (dropped.length) {
    console.warn(`Signal: dropped ${dropped.length} task(s):`);
    dropped.forEach((d) => console.warn(`  [${d.reason}] ${d.task.agent} → ${d.task.target_url}`));
  }

  if (!dryRun) {
    // Re-applies against a freshly-loaded, locked store — not the pre-call `store` above — so a
    // concurrent executor's write (e.g. CTR claiming a task) can't get silently clobbered.
    await mutateTaskStore((freshStore) => {
      expireStaleTasks(freshStore, nowISO);
      applyCheckbackScores(freshStore, output.checkback_scores, nowISO);
      appendTasks(freshStore, kept, nowISO);
      return freshStore;
    });
    saveQueryHistory(updateQueryHistory(_searchConsoleQueries, nowISO));
  } else {
    console.log("Signal: --dry-run, not persisting task store or query history.");
  }

  mkdirSync(join(__dir, "output"), { recursive: true });
  const result = { generatedAt: nowISO, usage, checkback_scores: output.checkback_scores, lesson: output.lesson, tasks: kept, dropped, daily_note: output.daily_note };
  writeFileSync(join(__dir, "output", "signal-latest.json"), JSON.stringify(result, null, 2));

  console.log(`\nLesson: ${output.lesson}`);
  console.log(`\nToday's tasks (${kept.length}):`);
  kept.forEach((t) => console.log(`  [${t.agent}] ${t.action} → ${t.target_url}${t.target_query ? ` ("${t.target_query}")` : ""}`));
  console.log(`\n${output.daily_note}`);
  console.log(`\nSaved → agents/signal/output/signal-latest.json`);
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
