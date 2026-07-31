#!/usr/bin/env node
// Scout's daily run — the sourcing loop, structured like Signal's (deterministic data gathering,
// one Claude reasoning pass, deterministic execution):
//
//   1. auth       refresh the AliExpress OAuth session (Test-status tokens: 24h access / 48h
//                 refresh — daily runs keep the window alive; a loud error with the re-auth URL
//                 is the only human-required failure mode)
//   2. re-verify  live freight/stock check on every catalog item — search results and listing
//                 stock lie; freight.query is truth, and thin-stock items (1-20 units) go stale
//                 fast
//   3. scan       rotate through the keyword queue per tier, collect unseen candidates
//   4. verify     freight-check the most promising unseen candidates (capped per run)
//   5. think      Claude (prompt.md) makes the merchandising judgments: what to import at what
//                 multiple, competition/channel calls, keyword territory for future runs
//   6. act        create Shopify DRAFTS (publishing stays human), update catalog state, record
//                 rejects with cooldowns, replenish the keyword queue, save the lesson
//
// Products only ever land as drafts. Scout never touches a live product — it flags, the
// operator decides. That's the human-approval gate for anything customer-facing.
import { readEnv } from "../analytics/lib/env.mjs";
import { getFreshSession } from "./lib/aliexpress-auth.mjs";
import { searchKeyword, verifyCandidate } from "./lib/market.mjs";
import { loadCatalog, mutateCatalog } from "./lib/catalog-store.mjs";
import { TIERS, computePrice, isNoise, passesTrust, SCAN_KEYWORDS_PER_TIER, VERIFY_CAP_PER_RUN, REJECT_COOLDOWN_DAYS } from "./lib/policy.mjs";
import { callScout } from "./lib/anthropic.mjs";
import { initShopify, createDraftProduct } from "./lib/shopify.mjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = () => new Date().toISOString().slice(0, 10);

async function main() {
  const { ALIEXPRESS_APP_KEY, ALIEXPRESS_APP_SECRET, ANTHROPIC_API_KEY } = readEnv([
    "ALIEXPRESS_APP_KEY",
    "ALIEXPRESS_APP_SECRET",
    "ANTHROPIC_API_KEY",
  ]);

  console.log("Scout: refreshing AliExpress session...");
  const session = await getFreshSession({ appKey: ALIEXPRESS_APP_KEY, appSecret: ALIEXPRESS_APP_SECRET });
  const auth = { appKey: ALIEXPRESS_APP_KEY, appSecret: ALIEXPRESS_APP_SECRET, session };

  const catalog = loadCatalog();

  // --- 2. re-verify existing catalog ---
  console.log(`Scout: re-verifying ${catalog.products.length} catalog item(s)...`);
  const verificationUpdates = [];
  for (const p of catalog.products) {
    if (p.status === "retired") continue;
    try {
      const v = await verifyCandidate({ itemId: p.itemId, tier: p.tier, auth });
      verificationUpdates.push({
        itemId: p.itemId,
        title: p.title,
        previousStock: p.stock,
        ok: v.ok,
        stock: v.ok ? v.stock : 0,
        note: v.ok ? `stock ${p.stock} -> ${v.stock}, delivery ${v.deliveryMin}-${v.deliveryMax}d` : v.reason,
      });
    } catch (e) {
      verificationUpdates.push({ itemId: p.itemId, title: p.title, ok: false, note: `verify error: ${e.message.slice(0, 120)}` });
    }
    await sleep(700);
  }

  // --- 3. scan keyword territories ---
  const knownIds = new Set(catalog.products.map((p) => p.itemId));
  const cooldownMs = REJECT_COOLDOWN_DAYS * 86400_000;
  const rejectedRecently = (id) => {
    const r = catalog.rejected[id];
    return r && Date.now() - new Date(r.on).getTime() < cooldownMs;
  };

  const scanResults = [];
  const unseen = new Map(); // itemId -> {searchHit, tier}
  for (const tier of Object.keys(TIERS)) {
    const queue = catalog.keywordQueue[tier] ?? [];
    const batch = queue.slice(0, SCAN_KEYWORDS_PER_TIER);
    for (const keyword of batch) {
      const res = await searchKeyword({ keyword, tier, auth });
      scanResults.push({ tier, keyword, ok: res.ok, totalCount: res.totalCount, returned: res.products.length });
      console.log(`Scout: scan [${tier}] "${keyword}" -> ${res.ok ? `${res.totalCount} total` : "API error after retries"}`);
      for (const hit of res.products) {
        if (knownIds.has(hit.itemId) || rejectedRecently(hit.itemId) || unseen.has(hit.itemId)) continue;
        if (isNoise(hit.title)) continue;
        unseen.set(hit.itemId, { hit, tier });
      }
      await sleep(700);
    }
    // rotate scanned keywords to the back of the queue
    catalog.keywordQueue[tier] = [...queue.slice(batch.length), ...batch];
  }

  // --- 4. verify the most promising unseen candidates ---
  // Rank by market proof (order volume) — verification is the expensive step, spend it well.
  const ranked = [...unseen.values()]
    .filter(({ hit, tier }) => passesTrust(tier, { rating: hit.rating, reviews: 0, orders: hit.orders }) || tier === "us-fast")
    .sort((a, b) => b.hit.orders - a.hit.orders)
    .slice(0, VERIFY_CAP_PER_RUN);

  console.log(`Scout: verifying ${ranked.length} of ${unseen.size} unseen candidate(s)...`);
  const candidates = [];
  const autoRejects = [];
  for (const { hit, tier } of ranked) {
    try {
      const v = await verifyCandidate({ itemId: hit.itemId, tier, auth });
      if (v.ok) {
        // Second trust gate on full detail (search "orders" and detail "reviews" differ)
        if (tier === "value-china" && !passesTrust(tier, { rating: v.rating, reviews: v.reviews, orders: hit.orders })) {
          autoRejects.push({ itemId: hit.itemId, reason: `trust below tier floor (${v.rating}★/${v.reviews} reviews/${hit.ordersRaw} orders)` });
        } else {
          candidates.push({ ...v, marketOrders: hit.ordersRaw });
        }
      } else {
        autoRejects.push({ itemId: hit.itemId, reason: v.reason });
      }
    } catch (e) {
      autoRejects.push({ itemId: hit.itemId, reason: `verify error: ${e.message.slice(0, 120)}` });
    }
    await sleep(700);
  }
  console.log(`Scout: ${candidates.length} candidate(s) passed verification, ${autoRejects.length} auto-rejected.`);

  // --- 5. think ---
  const systemPrompt = readFileSync(join(__dir, "prompt.md"), "utf8");
  const userInput = {
    date: today(),
    policy: TIERS,
    catalog: {
      counts: countByTierAndStatus(catalog.products),
      products: catalog.products.map((p) => ({
        itemId: p.itemId, tier: p.tier, collection: p.collection, title: p.title,
        status: p.status, price: p.price, landedCost: p.landedCost, stock: p.stock,
        lastVerifiedOn: p.lastVerifiedOn,
      })),
    },
    verification_updates: verificationUpdates,
    candidates,
    scan_results: scanResults,
    keyword_history: catalog.keywordHistory,
    recent_lessons: catalog.lessons.slice(-7),
  };

  console.log("Scout: calling Claude...");
  const { output } = await callScout({ apiKey: ANTHROPIC_API_KEY, systemPrompt, userInput });

  // --- 6. act ---
  await initShopify();
  const candidateById = new Map(candidates.map((c) => [String(c.itemId), c]));
  const imported = [];
  for (const imp of output.imports) {
    const v = candidateById.get(String(imp.itemId));
    if (!v) { console.warn(`Scout: skipping import of unknown/unverified itemId ${imp.itemId}`); continue; }
    if (imported.filter((i) => i.tier === v.tier).length >= TIERS[v.tier].importCapPerRun) {
      console.warn(`Scout: import cap reached for tier ${v.tier}, skipping ${imp.itemId}`);
      continue;
    }
    const { price, multiple } = computePrice(v.landedCost, v.tier, imp.price_multiple);
    try {
      const product = await createDraftProduct({ v, copy: imp.copy, price, priceMultiple: multiple, tier: v.tier, collection: imp.collection });
      imported.push({
        itemId: String(v.itemId), skuId: String(v.skuId), tier: v.tier, collection: imp.collection,
        title: imp.copy.title, shopifyId: product.id, status: "draft",
        landedCost: v.landedCost, price, priceMultiple: multiple,
        stock: v.stock, deliveryMin: v.deliveryMin, deliveryMax: v.deliveryMax, shipFrom: v.shipFrom,
        rating: v.rating, reviews: v.reviews, orders: v.marketOrders,
        pricingRationale: imp.pricing_rationale, competition: imp.competition,
        marketingAngle: imp.marketing_angle, channelEligibility: imp.channel_eligibility,
        importedOn: today(), lastVerifiedOn: today(),
        verifyHistory: [{ on: today(), ok: true, stock: v.stock, note: "initial import" }],
      });
      console.log(`Scout: imported DRAFT [${v.tier}/${imp.collection}] "${imp.copy.title}" — $${price} (${multiple}x on $${v.landedCost.toFixed(2)})`);
    } catch (e) {
      console.error(`Scout: import failed for ${imp.itemId}: ${e.message.slice(0, 200)}`);
    }
    await sleep(500);
  }

  await mutateCatalog((store) => {
    store.products.push(...imported);
    // fold re-verification results into catalog records
    const vuById = new Map(verificationUpdates.map((u) => [u.itemId, u]));
    for (const p of store.products) {
      const u = vuById.get(p.itemId);
      if (!u) continue;
      p.stock = u.stock;
      p.lastVerifiedOn = today();
      if (!u.ok && p.status === "draft") p.status = "stale";
      (p.verifyHistory ??= []).push({ on: today(), ok: u.ok, stock: u.stock, note: u.note });
      if (p.verifyHistory.length > 30) p.verifyHistory = p.verifyHistory.slice(-30);
    }
    for (const r of [...autoRejects, ...output.rejects]) store.rejected[String(r.itemId)] = { reason: r.reason, on: today() };
    for (const exp of output.keyword_expansions) {
      const q = (store.keywordQueue[exp.tier] ??= []);
      if (!q.includes(exp.keyword)) q.push(exp.keyword);
    }
    for (const s of scanResults) {
      const h = ((store.keywordHistory[s.tier] ??= {})[s.keyword] ??= {});
      Object.assign(h, { lastRun: today(), totalCount: s.totalCount, returned: s.returned, ok: s.ok });
      h.imported = (h.imported ?? 0) + imported.filter((i) => i.tier === s.tier).length; // coarse per-tier credit
    }
    store.keywordQueue = { ...store.keywordQueue };
    store.lessons.push({ on: today(), lesson: output.lesson });
    if (store.lessons.length > 60) store.lessons = store.lessons.slice(-60);
  });

  // --- digest ---
  const OUT_DIR = join(__dir, "output");
  mkdirSync(OUT_DIR, { recursive: true });
  const digest = {
    date: today(),
    imported: imported.map(({ itemId, title, tier, collection, price, priceMultiple, channelEligibility }) => ({ itemId, title, tier, collection, price, priceMultiple, channelEligibility })),
    rejected: [...autoRejects, ...output.rejects],
    catalog_flags: output.catalog_flags,
    keyword_expansions: output.keyword_expansions,
    lesson: output.lesson,
    daily_note: output.daily_note,
  };
  writeFileSync(join(OUT_DIR, "scout-latest.json"), JSON.stringify(digest, null, 2));

  console.log(`\nLesson: ${output.lesson}\n`);
  if (output.catalog_flags.length) {
    console.log("Catalog flags (need operator attention):");
    for (const f of output.catalog_flags) console.log(`  [${f.itemId}] ${f.flag}`);
  }
  console.log(`\nOperator note: ${output.daily_note}`);
  console.log(`\nSaved → agents/dropship/output/scout-latest.json`);
}

function countByTierAndStatus(products) {
  const out = {};
  for (const p of products) {
    out[p.tier] ??= {};
    out[p.tier][p.status] = (out[p.tier][p.status] ?? 0) + 1;
  }
  return out;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
