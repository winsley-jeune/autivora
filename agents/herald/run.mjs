#!/usr/bin/env node
// Herald's run — the social distribution lane, Phase 1 (drafts + manual posting). Pulls live
// purchasable products (real images/prices) and published articles, drafts platform-native
// posts with UTM-tagged links, and queues them for operator approval. Publishing is always
// human in Phase 1; Phase 2 adds API posting AFTER approval, never instead of it.
//
// Topping-up model: keeps up to QUEUE_TARGET unposted drafts waiting. Runs daily in the loop
// but exits instantly when the queue is already topped up — so cadence is controlled by how
// fast the operator approves/posts, not by the cron.
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readEnv } from "../analytics/lib/env.mjs";
import { initShopify, shopifyApi } from "../dropship/lib/shopify.mjs";
import { callHerald } from "./lib/anthropic.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = join(__dir, "state");
const QUEUE_PATH = join(STATE_DIR, "post-queue.json");
const QUEUE_TARGET = 5; // unposted drafts to keep waiting for the operator (5 platforms)
const REDRAFT_COOLDOWN_DAYS = 14;
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

function articlesFromRewrites() {
  // Light extraction — slugs/titles only, as idea fodder; no need to transpile the module.
  const src = readFileSync(join(__dir, "..", "..", "lib", "blog-rewrites.ts"), "utf8");
  const out = [];
  const re = /"slug":\s*"([^"]+)",\s*\n\s*"title":\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) out.push({ url: `/blog/${m[1]}`, title: m[2] });
  return out;
}

async function main() {
  const { ANTHROPIC_API_KEY } = readEnv(["ANTHROPIC_API_KEY"]);

  const queue = loadQueue();
  const unposted = queue.filter((p) => p.status === "needs_approval" || p.status === "approved");
  const wanted = QUEUE_TARGET - unposted.length;
  if (wanted <= 0) {
    console.log(`Herald: queue already holds ${unposted.length} unposted draft(s) — nothing to do.`);
    return;
  }

  await initShopify();
  const res = await shopifyApi("GET", "products.json?limit=250&status=active&fields=id,title,handle,tags,images,variants");
  const products = res.products.map((p) => ({
    url: `/product/${p.handle}`,
    title: p.title,
    price: p.variants[0]?.price,
    collections: p.tags,
    images: (p.images ?? []).slice(0, 3).map((i) => i.src),
  })).filter((p) => p.images.length);

  let ga4Channels = [];
  try {
    const snap = JSON.parse(readFileSync(join(__dir, "..", "analytics", "output", "snapshot-latest.json"), "utf8"));
    ga4Channels = snap.ga4?.byChannel ?? [];
  } catch {}

  const cutoff = new Date(Date.now() - REDRAFT_COOLDOWN_DAYS * 86400_000).toISOString().slice(0, 10);
  const recentSubjects = queue.filter((p) => p.queuedOn >= cutoff).map((p) => ({ platform: p.platform, subject_url: p.subject_url }));

  const systemPrompt = readFileSync(join(__dir, "prompt.md"), "utf8");
  const userInput = {
    date: today(),
    draft_count_requested: wanted,
    platforms: ["pinterest", "instagram", "facebook", "facebook-group", "tiktok-photo"],
    products,
    articles: articlesFromRewrites(),
    channel_data: ga4Channels,
    recent_drafts: recentSubjects,
  };

  console.log(`Herald: drafting ${wanted} post(s) across pinterest/instagram...`);
  const { output } = await callHerald({ apiKey: ANTHROPIC_API_KEY, systemPrompt, userInput });
  const posts = (Array.isArray(output.posts) ? output.posts : []).slice(0, wanted);

  const validImage = new Set(products.flatMap((p) => p.images));
  const entries = posts
    .filter((p) => validImage.has(p.image_url) || p.subject_url.startsWith("/blog/"))
    .map((p) => ({ ...p, status: "needs_approval", queuedOn: today() }));
  saveQueue([...queue, ...entries]);

  mkdirSync(join(__dir, "output"), { recursive: true });
  writeFileSync(join(__dir, "output", "herald-latest.json"), JSON.stringify({ date: today(), queued: entries, lesson: output.lesson, daily_note: output.daily_note }, null, 2));

  console.log(`\nLesson: ${output.lesson}\n`);
  console.log(`Operator note: ${output.daily_note}`);
  console.log(`\n${entries.length} draft(s) awaiting your approval → agents/herald/state/post-queue.json`);
  for (const e of entries) {
    console.log(`\n  [${e.platform}] ${e.subject_url}${e.needs_retouch ? "  (image needs retouch before posting)" : ""}`);
    console.log(`  ${e.title || e.caption.split("\n")[0]}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
