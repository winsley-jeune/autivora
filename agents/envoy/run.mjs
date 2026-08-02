#!/usr/bin/env node
// Envoy's run — external-link outreach DRAFTER. Finds real link targets via server-side web
// search and queues personalized pitch drafts for the operator. Sending is always human: this
// agent's write-path ends at state/outreach-queue.json + a digest, never at an outbox (the
// standing automation-tier rule: drafting is autonomous, external publishing is a human act).
//
// Usage: node agents/envoy/run.mjs [--all]   # default: up to 2 tasks/run (search-heavy);
//                                            # --all processes every open envoy task
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readEnv } from "../analytics/lib/env.mjs";
import { loadTasks, claimTask, completeTask, releaseTask } from "../signal/lib/task-store.mjs";
import { callEnvoy } from "./lib/anthropic.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = join(__dir, "state");
const QUEUE_PATH = join(STATE_DIR, "outreach-queue.json");
const TASK_CAP = process.argv.includes("--all") ? Infinity : 2;
const today = () => new Date().toISOString().slice(0, 10);

function loadQueue() {
  if (!existsSync(QUEUE_PATH)) return [];
  return JSON.parse(readFileSync(QUEUE_PATH, "utf8"));
}

function saveQueue(queue) {
  mkdirSync(STATE_DIR, { recursive: true });
  const tmp = QUEUE_PATH + ".tmp";
  writeFileSync(tmp, JSON.stringify(queue, null, 2));
  renameSync(tmp, QUEUE_PATH);
}

async function main() {
  const { ANTHROPIC_API_KEY } = readEnv(["ANTHROPIC_API_KEY"]);

  const store = loadTasks();
  const open = store.tasks.filter((t) => t.agent === "envoy" && t.status === "open").slice(0, TASK_CAP);
  if (!open.length) {
    console.log("Envoy: no open envoy tasks — nothing to do.");
    return;
  }
  console.log(`Envoy: drafting outreach for ${open.length} task(s): ${open.map((t) => "#" + t.id).join(", ")}`);

  const claimed = [];
  for (const t of open) {
    try {
      await claimTask(t.id, "envoy");
      claimed.push(t);
    } catch (e) {
      console.warn(`Envoy: could not claim #${t.id}: ${e.message}`);
    }
  }
  if (!claimed.length) return;

  const systemPrompt = readFileSync(join(__dir, "prompt.md"), "utf8");
  const allEntries = [];
  const notes = [];

  // One task per API request: a 4-asset combined call ran long enough to hit socket timeouts
  // even before streaming; per-task calls are shorter, cheaper to retry, and fail independently.
  for (const t of claimed) {
    const queue = loadQueue();
    const pitchedDomains = [...new Set(queue.map((q) => { try { return new URL(q.target_url).hostname; } catch { return null; } }).filter(Boolean))];
    const userInput = {
      date: today(),
      site: "https://autivara.com",
      brand_positioning: "Design-led aroma diffusers (car/home/commercial). Differentiator: refillable, waterless, NO required subscription — own your oil, vs Pura/Aroma360/AromaTech lock-in.",
      tasks: [{ id: t.id, asset_url: `https://autivara.com${t.target_url}`, hypothesis: t.hypothesis, evidence: t.evidence }],
      already_pitched_domains: pitchedDomains,
    };
    try {
      console.log(`Envoy: researching live targets for task #${t.id} (${t.target_url})...`);
      const { output } = await callEnvoy({ apiKey: ANTHROPIC_API_KEY, systemPrompt, userInput });
      const targets = Array.isArray(output.targets) ? output.targets : [];
      const fresh = targets.filter((x) => {
        try { return !pitchedDomains.includes(new URL(x.target_url).hostname); } catch { return false; }
      });
      const entries = fresh.map((x) => ({ ...x, task_id: t.id, status: "needs_approval", queuedOn: today() }));
      saveQueue([...queue, ...entries]);
      allEntries.push(...entries);
      notes.push(`#${t.id}: ${output.daily_note}`);
      await completeTask(t.id, { note: `${entries.length} pitch draft(s) queued for operator review (outreach-queue.json)` });
      console.log(`Envoy: task #${t.id} done — ${entries.length} draft(s) queued.`);
    } catch (e) {
      await releaseTask(t.id, `envoy call failed: ${e.message.slice(0, 120)}`);
      console.error(`Envoy: task #${t.id} released after failure: ${e.message.slice(0, 200)}`);
    }
  }

  mkdirSync(join(__dir, "output"), { recursive: true });
  writeFileSync(join(__dir, "output", "envoy-latest.json"), JSON.stringify({ date: today(), queued: allEntries, notes }, null, 2));

  console.log(`\n${allEntries.length} draft(s) awaiting your review → agents/envoy/state/outreach-queue.json`);
  for (const e of allEntries) console.log(`  [#${e.task_id}] ${e.site_name} — ${e.target_url}\n     contact: ${e.contact_method} | subject: ${e.pitch_subject}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
