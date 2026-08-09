#!/usr/bin/env node
// Operator CLI for the draft approval queue (agents/lib/drafts-store.mjs) — the replacement
// for hand-editing post-queue.json / outreach-queue.json now that drafts live in SQLite.
//
//   npm run queue                        # pending drafts across herald + envoy
//   npm run queue -- list [agent]        # all drafts, optionally one agent
//   npm run queue -- show <id>           # full draft body
//   npm run queue -- mark <id> <status>  # approve/post/retire: approved | posted | obsolete | needs_approval
import { listDrafts, markDraft } from "../lib/drafts-store.mjs";

const [cmd = "pending", a1, a2] = process.argv.slice(2);
const AGENTS = ["herald", "envoy"];
const STATUSES = new Set(["needs_approval", "approved", "posted", "obsolete"]);

function summary(e) {
  const what = e.agent === "herald"
    ? `[${e.platform}] ${e.subject_url} — ${e.title ?? (e.caption ?? "").split("\n")[0]}`
    : `[task #${e.task_id}] ${e.site_name} — ${e.target_url} | ${e.pitch_subject}`;
  return `#${String(e.id).padStart(3)} ${e.status.padEnd(14)} ${e.queuedOn}  ${what}`;
}

if (cmd === "pending" || cmd === "list") {
  const agents = a1 ? [a1] : AGENTS;
  for (const agent of agents) {
    const drafts = cmd === "pending" ? listDrafts(agent, { status: "needs_approval" }) : listDrafts(agent);
    console.log(`\n${agent} — ${drafts.length} draft(s)${cmd === "pending" ? " awaiting approval" : ""}`);
    for (const e of drafts) console.log(`  ${summary(e)}`);
  }
} else if (cmd === "show") {
  const all = AGENTS.flatMap((agent) => listDrafts(agent)).filter((e) => e.id === Number(a1));
  if (!all.length) { console.error(`No draft with id ${a1}`); process.exit(1); }
  console.log(JSON.stringify(all[0], null, 2));
} else if (cmd === "mark") {
  if (!STATUSES.has(a2)) { console.error(`Status must be one of: ${[...STATUSES].join(", ")}`); process.exit(1); }
  const doc = markDraft(Number(a1), a2);
  console.log(`Draft #${a1} → ${a2}${doc.pitch_subject ? ` (${doc.pitch_subject})` : doc.title ? ` (${doc.title})` : ""}`);
} else {
  console.error("Usage: queue [pending|list [agent]|show <id>|mark <id> <status>]");
  process.exit(1);
}
