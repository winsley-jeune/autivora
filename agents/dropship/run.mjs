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
//   2.5 observe   demand-first inversion (operator, 2026-08-06): when the active-hypothesis
//                 pool is below target, a web-search research pass (prompt-demand.md) observes
//                 demand already happening in the market and emits cited hypotheses. Discovery
//                 starts from observed demand, never from what AliExpress search happens to
//                 surface — its ranking IS the saturation we must reject.
//   3. scan       hypothesis keywords lead every batch (reverse-sourcing supply for observed
//                 demand); the operator-seeded queue is fallback territory, not the strategy
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
import { loadBands, saveBands, matchBand, maxLandedOf } from "./lib/market-bands.mjs";
import { TIERS, computePrice, isNoise, passesTrust, SCAN_KEYWORDS_PER_TIER, VERIFY_CAP_PER_RUN, REJECT_COOLDOWN_DAYS } from "./lib/policy.mjs";
import { callScout, callDemandResearch } from "./lib/anthropic.mjs";
import { HYPOTHESIS_TARGET, mineSearchDemand, provenSales, WINNER_DEFINITION, activeHypotheses, staleHypotheses, applyResearchOutput } from "./lib/demand.mjs";
import { initShopify, createDraftProduct, createBundleDraft } from "./lib/shopify.mjs";
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
    if (p.type === "bundle") {
      // A bundle lives or dies with its weakest component — re-verify each part.
      const parts = [];
      for (const c of p.components ?? []) {
        try {
          parts.push(await verifyCandidate({ itemId: c.itemId, tier: "us-fast", auth }));
        } catch (e) {
          parts.push({ ok: false, reason: `verify error: ${e.message.slice(0, 80)}` });
        }
        await sleep(700);
      }
      const ok = parts.length > 0 && parts.every((x) => x.ok);
      const minStock = ok ? Math.min(...parts.map((x) => x.stock)) : 0;
      verificationUpdates.push({
        itemId: p.itemId, title: p.title, previousStock: p.stock, ok, stock: minStock,
        note: ok ? `bundle ok, limiting component stock ${minStock}` : `bundle broken: ${parts.filter((x) => !x.ok).map((x) => x.reason).join("; ")}`,
      });
      continue;
    }
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

  // --- 2.5 observe demand (see header) ---
  // The analytics snapshot is loaded once here and reused by the think phase below.
  let snapshot = null;
  try {
    snapshot = JSON.parse(readFileSync(join(__dir, "..", "analytics", "output", "snapshot-latest.json"), "utf8"));
  } catch {}

  let researchNote = null;
  const activeBefore = activeHypotheses(catalog);
  if (activeBefore.length < HYPOTHESIS_TARGET) {
    console.log(`Scout: ${activeBefore.length}/${HYPOTHESIS_TARGET} active demand hypotheses — running live demand research...`);
    try {
      const demandPrompt = readFileSync(join(__dir, "prompt-demand.md"), "utf8");
      const { output: research } = await callDemandResearch({
        apiKey: ANTHROPIC_API_KEY,
        systemPrompt: demandPrompt,
        userInput: {
          date: today(),
          winner_definition: WINNER_DEFINITION,
          search_demand: mineSearchDemand(snapshot),
          proven_sales: provenSales(snapshot),
          current_hypotheses: activeBefore,
          stale_hypotheses: staleHypotheses(catalog).map((h) => h.id),
          market_bands: Object.fromEntries(Object.entries(loadBands()).map(([k, b]) => [k, { usTypical: b.usTypical, anchor: b.anchor }])),
          catalog_summary: countByTierAndStatus(catalog.products),
          recent_lessons: catalog.lessons.slice(-5),
        },
      });
      const added = applyResearchOutput(catalog, research, today());
      researchNote = research.research_note;
      console.log(`Scout: demand research added ${added.length} hypothesis(es), retired ${(research.retire_hypothesis_ids ?? []).length}.`);
      for (const h of added) console.log(`  [${h.id}] ${h.hypothesis.slice(0, 110)} (US anchor ~$${h.usAnchorPrice}, ${h.anchor})`);
    } catch (e) {
      // Research failing must not kill sourcing — the run degrades to queue-only scanning.
      console.error(`Scout: demand research failed (continuing with existing hypotheses): ${e.message.slice(0, 160)}`);
    }
  }

  // --- 3. scan — hypothesis-led, queue-backed ---
  const bands = loadBands();
  let bandGated = 0;
  const knownIds = new Set(catalog.products.map((p) => p.itemId));
  const cooldownMs = REJECT_COOLDOWN_DAYS * 86400_000;
  const rejectedRecently = (id) => {
    const r = catalog.rejected[id];
    return r && Date.now() - new Date(r.on).getTime() < cooldownMs;
  };

  const activeHyps = activeHypotheses(catalog);
  const hypById = new Map(activeHyps.map((h) => [h.id, h]));
  const scanResults = [];
  const unseen = new Map(); // itemId -> {hit, tier, band, hypothesisId}
  for (const tier of Object.keys(TIERS)) {
    const queue = catalog.keywordQueue[tier] ?? [];
    const history = catalog.keywordHistory[tier] ?? {};
    // Hypothesis-derived keywords lead every batch — they reverse-source observed demand and
    // carry their own US anchor. The operator-seeded queue fills remaining slots. Within each
    // group, never-scanned terms first (fresh territory is the highest-information scan).
    const freshness = (e) => (history[e.keyword] ? 1 : 0);
    const hypEntries = activeHyps
      .filter((h) => h.tier === tier)
      .flatMap((h) => (h.keywords ?? []).map((keyword) => ({
        keyword,
        hypothesisId: h.id,
        // The hypothesis's observed US price fills gaps in the band oracle: same /3 landed
        // cap the CEO gate implies, applied mechanically pre-verify.
        anchorMaxLanded: h.usAnchorPrice > 0 ? Math.round((h.usAnchorPrice / 3) * 100) / 100 : null,
      })))
      .sort((a, b) => freshness(a) - freshness(b));
    const queueEntries = queue
      .map((keyword) => ({ keyword, hypothesisId: null, anchorMaxLanded: null }))
      .sort((a, b) => freshness(a) - freshness(b));
    const batch = [...hypEntries, ...queueEntries]
      .filter((e, i, arr) => arr.findIndex((x) => x.keyword === e.keyword) === i)
      .slice(0, SCAN_KEYWORDS_PER_TIER);

    for (const entry of batch) {
      const res = await searchKeyword({ keyword: entry.keyword, tier, auth });
      scanResults.push({ tier, keyword: entry.keyword, hypothesisId: entry.hypothesisId, ok: res.ok, totalCount: res.totalCount, returned: res.products.length });
      const tag = entry.hypothesisId ? `${tier}|${entry.hypothesisId}` : tier;
      console.log(`Scout: scan [${tag}] "${entry.keyword}" -> ${res.ok ? `${res.totalCount} total` : "API error after retries"}`);
      if (entry.hypothesisId) hypById.get(entry.hypothesisId).yields.scans++;
      for (const hit of res.products) {
        if (knownIds.has(hit.itemId) || rejectedRecently(hit.itemId) || unseen.has(hit.itemId)) continue;
        if (isNoise(hit.title)) continue;
        // THE MECHANICAL BAND GATE (CEO gate, 3x floor): a strong-anchor band caps landed cost
        // at usTypical/3 — anything above the cap can never satisfy the law, so it never
        // reaches the expensive verify stage. Hypothesis anchors cover items the band oracle
        // doesn't know; items with neither pass through for the model's judgment.
        const band = matchBand(bands, hit.title);
        const cap = band?.maxLanded ?? entry.anchorMaxLanded;
        if (cap != null && hit.price > cap) { bandGated++; continue; }
        if (entry.hypothesisId) hypById.get(entry.hypothesisId).yields.candidates++;
        unseen.set(hit.itemId, { hit, tier, band, hypothesisId: entry.hypothesisId });
      }
      await sleep(700);
    }
    // rotate scanned QUEUE keywords to the back (hypothesis keywords live on the hypothesis)
    const scannedQueueKws = batch.filter((e) => !e.hypothesisId).map((e) => e.keyword);
    catalog.keywordQueue[tier] = [...queue.filter((k) => !scannedQueueKws.includes(k)), ...scannedQueueKws];
  }

  console.log(`Scout: mechanical 7x gate dropped ${bandGated} candidate(s) pre-verify (price > band maxLanded).`);

  // --- 4. verify the most promising unseen candidates ---
  // Per-tier quotas (Scout-found starvation bug, run 3) + MARGIN-DOLLAR RANKING (CEO change #4):
  // at a fixed 7x, margin ∝ landed cost, so among band-gated survivors we verify the PRICIEST
  // first, not the highest-order-count — order volume is a saturation warning, not the
  // objective. It survives only as a mild damp against mega-sellers.
  const byTier = {};
  for (const entry of unseen.values()) {
    const { hit, tier } = entry;
    if (tier === "value-china" && hit.orders < 100 && !passesTrust(tier, { rating: hit.rating, reviews: 0, orders: hit.orders })) continue;
    (byTier[tier] ??= []).push(entry);
  }
  const marginScore = ({ hit }) => hit.price * (hit.orders > 5000 ? 0.5 : 1); // $ headroom, damped when saturated
  byTier["us-fast"]?.sort((a, b) => marginScore(b) - marginScore(a));
  byTier["value-china"]?.sort((a, b) => marginScore(b) - marginScore(a));
  const usSlots = Math.min(byTier["us-fast"]?.length ?? 0, Math.ceil(VERIFY_CAP_PER_RUN / 2));
  const ranked = [
    ...(byTier["us-fast"] ?? []).slice(0, usSlots),
    ...(byTier["value-china"] ?? []).slice(0, VERIFY_CAP_PER_RUN - usSlots),
  ];

  console.log(`Scout: verifying ${ranked.length} of ${unseen.size} unseen candidate(s)...`);
  const candidates = [];
  const autoRejects = [];
  for (const { hit, tier, band, hypothesisId } of ranked) {
    try {
      const v = await verifyCandidate({ itemId: hit.itemId, tier, auth });
      if (v.ok) {
        // Second trust gate on full detail (search "orders" and detail "reviews" differ)
        if (tier === "value-china" && !passesTrust(tier, { rating: v.rating, reviews: v.reviews, orders: hit.orders })) {
          autoRejects.push({ itemId: hit.itemId, reason: `trust below tier floor (${v.rating}★/${v.reviews} reviews/${hit.ordersRaw} orders)` });
        } else if (band?.maxLanded != null && v.landedCost > band.maxLanded) {
          // Re-check the mechanical gate on TRUE landed cost (search price excludes shipping)
          autoRejects.push({ itemId: hit.itemId, reason: `landed $${v.landedCost.toFixed(2)} > band "${band.key}" maxLanded $${band.maxLanded} (7x law, mechanical)` });
        } else {
          candidates.push({
            ...v,
            marketOrders: hit.ordersRaw,
            marketBand: band ? { key: band.key, usTypical: band.usTypical, anchor: band.anchor, maxLanded: band.maxLanded } : null,
            hypothesisId: hypothesisId ?? null,
            demandHypothesis: hypothesisId ? hypById.get(hypothesisId)?.hypothesis : null,
          });
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
  // SALES→SOURCING FEEDBACK: real orders reach Scout every run (see provenSales contract —
  // a sale is a lead to exploit, not a validated winner). Snapshot loaded in phase 2.5.
  const systemPrompt = readFileSync(join(__dir, "prompt.md"), "utf8");
  const userInput = {
    date: today(),
    policy: TIERS,
    winner_definition: WINNER_DEFINITION,
    market_bands: Object.fromEntries(Object.entries(bands).map(([k, b]) => [k, { usTypical: b.usTypical, anchor: b.anchor, maxLanded: maxLandedOf(b), note: b.note }])),
    band_gate_drops_this_run: bandGated,
    demand_hypotheses: activeHypotheses(catalog),
    proven_sales: provenSales(snapshot),
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
  // Defensive normalization: if the model's output was truncated (max_tokens mid-tool-call),
  // degrade to a no-op decision pass instead of crashing after the expensive verify phase.
  for (const k of ["imports", "rejects", "keyword_expansions", "catalog_flags", "bundle_proposals", "market_band_updates"]) {
    if (!Array.isArray(output[k])) output[k] = [];
  }
  output.lesson ??= "(output truncated — no lesson captured this run)";
  output.daily_note ??= "(output truncated)";
  // Recurring model failure mode (3x now): the entire imports payload gets serialized as
  // literal tool-call markup INSIDE the lesson string, leaving output.imports empty. Recover
  // the leaked JSON before sanitizing — silently discarding it loses real sourcing decisions
  // (run 7 lost two operator-approvable humidor proposals this way).
  if (typeof output.lesson === "string" && output.imports.length === 0) {
    const leak = output.lesson.match(/<parameter name="imports">\s*(\[[\s\S]*?)\s*(?:<\/parameter|$)/);
    if (leak) {
      try {
        const arr = JSON.parse(leak[1]);
        if (Array.isArray(arr)) {
          output.imports = arr;
          console.warn(`Scout: recovered ${arr.length} import decision(s) leaked into the lesson field`);
        }
      } catch {}
    }
  }
  for (const k of ["lesson", "daily_note"]) {
    if (typeof output[k] === "string" && output[k].includes("</parameter")) output[k] = output[k].split("</parameter")[0].trim();
  }

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
    // CEO-GATE FLOOR (operator, 2026-08-01 — supersedes the strict-7x law; the exception lane
    // stays revoked): sub-floor proposals are rejected outright and cooled down like any other
    // failed candidate. The floor is minMultiple (3x); the multiple above it is market-set.
    const floor = TIERS[v.tier].minMultiple;
    if (imp.price_multiple && imp.price_multiple < floor) {
      console.warn(`Scout: rejecting sub-floor import ${imp.itemId} — proposed ${imp.price_multiple}x, strict ${floor}x law, no exception lane`);
      autoRejects.push({ itemId: String(imp.itemId), reason: `proposed ${imp.price_multiple}x below the strict ${floor}x floor (cannot hold 7x within US market band)` });
      continue;
    }
    const { price, multiple } = computePrice(v.landedCost, v.tier, imp.price_multiple);
    try {
      const product = await createDraftProduct({ v, copy: imp.copy, price, priceMultiple: multiple, tier: v.tier, collection: imp.collection });
      if (v.hypothesisId && hypById.has(v.hypothesisId)) hypById.get(v.hypothesisId).yields.imports++;
      imported.push({
        hypothesisId: v.hypothesisId ?? null,
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

  // BUNDLE ENGINE (CEO change #3): manufacture anchor-free composites from verified parts.
  // Code owns the arithmetic — summed landed, floor-clamped multiple — the model owns the
  // taste (which components form a coherent offer a USA buyer wants as a SET).
  const bundles = [];
  for (const bp of output.bundle_proposals.slice(0, 2)) {
    const comps = (bp.component_item_ids ?? []).map((id) => {
      const c = candidateById.get(String(id));
      if (c) return { itemId: String(c.itemId), skuId: String(c.skuId), landedCost: c.landedCost, images: c.images ?? [] };
      const p = catalog.products.find((x) => x.itemId === String(id) && x.status !== "retired");
      if (p) return { itemId: p.itemId, skuId: p.skuId, landedCost: p.landedCost, images: [] };
      return null;
    });
    if (comps.length < 2 || comps.some((c) => !c)) {
      console.warn(`Scout: dropping bundle "${bp.title}" — components must be >=2 known items`);
      continue;
    }
    const landedCost = Math.round(comps.reduce((s, c) => s + c.landedCost, 0) * 100) / 100;
    // CEO-gate floor (3x), not the revoked 7x — a bundle must still pass the competitive test
    // against its own components' standalone prices, which a forced 7x can't.
    const multiple = Math.max(3, Number(bp.price_multiple) || 0);
    const price = (Math.round(landedCost * multiple) - 0.01).toFixed(2);
    try {
      const product = await createBundleDraft({ components: comps, copy: bp.copy, price, priceMultiple: multiple, landedCost, tier: "bundle", collection: bp.collection });
      bundles.push({
        itemId: `bundle-${product.id}`, skuId: null, type: "bundle", tier: "bundle", collection: bp.collection,
        title: bp.copy.title, shopifyId: product.id, status: "draft",
        landedCost, price, priceMultiple: multiple,
        components: comps.map(({ itemId, skuId, landedCost: lc }) => ({ itemId, skuId, landedCost: lc, qty: 1 })),
        pricingRationale: bp.rationale,
        importedOn: today(), lastVerifiedOn: today(),
        verifyHistory: [{ on: today(), ok: true, note: "bundle created from verified components" }],
      });
      console.log(`Scout: created BUNDLE draft "${bp.copy.title}" — $${price} (${multiple}x on summed landed $${landedCost})`);
    } catch (e) {
      console.error(`Scout: bundle creation failed for "${bp.title}": ${e.message.slice(0, 200)}`);
    }
    await sleep(500);
  }

  // Band updates from the model's market knowledge move the mechanical caps — conservatively.
  if (output.market_band_updates.length) {
    const b = loadBands();
    for (const u of output.market_band_updates) {
      if (b[u.category]) {
        Object.assign(b[u.category], { usTypical: u.us_typical_price, anchor: u.anchor, note: u.rationale, source: "model", updatedOn: today() });
      } else if (u.match) {
        b[u.category] = { match: u.match, usTypical: u.us_typical_price, anchor: u.anchor, note: u.rationale, source: "model", updatedOn: today() };
      }
      console.log(`Scout: market band "${u.category}" -> usTypical $${u.us_typical_price} (${u.anchor}) — ${u.rationale.slice(0, 100)}`);
    }
    saveBands(b);
  }

  await mutateCatalog((store) => {
    store.products.push(...imported, ...bundles);
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
    // Persist the ROTATED queues (bug fix: rotation previously happened on the local copy only,
    // so every run re-scanned the same first N keywords and Scout's expansions never reached
    // the front — it was steering with the wheel disconnected).
    for (const tier of Object.keys(catalog.keywordQueue)) store.keywordQueue[tier] = [...catalog.keywordQueue[tier]];
    for (const exp of output.keyword_expansions) {
      const q = (store.keywordQueue[exp.tier] ??= []);
      if (!q.includes(exp.keyword)) q.push(exp.keyword);
    }
    for (const s of scanResults) {
      const h = ((store.keywordHistory[s.tier] ??= {})[s.keyword] ??= {});
      Object.assign(h, { lastRun: today(), totalCount: s.totalCount, returned: s.returned, ok: s.ok });
      h.imported = (h.imported ?? 0) + imported.filter((i) => i.tier === s.tier).length; // coarse per-tier credit
    }
    // Persist the hypothesis pool: research additions/retirements and this run's yield
    // counters (mutated in place on catalog.demandHypotheses via hypById references).
    store.demandHypotheses = catalog.demandHypotheses;
    store.lessons.push({ on: today(), lesson: output.lesson });
    if (store.lessons.length > 60) store.lessons = store.lessons.slice(-60);
  });

  // --- digest ---
  const OUT_DIR = join(__dir, "output");
  mkdirSync(OUT_DIR, { recursive: true });
  const digest = {
    date: today(),
    demand_research_note: researchNote,
    demand_hypotheses: activeHypotheses(catalog).map(({ id, hypothesis, usAnchorPrice, anchor, tier, yields }) => ({ id, hypothesis, usAnchorPrice, anchor, tier, yields })),
    imported: imported.map(({ itemId, title, tier, collection, price, priceMultiple, channelEligibility, hypothesisId }) => ({ itemId, title, tier, collection, price, priceMultiple, channelEligibility, hypothesisId })),
    bundles: bundles.map(({ title, price, priceMultiple, landedCost, components }) => ({ title, price, priceMultiple, landedCost, componentCount: components.length })),
    band_gate_drops: bandGated,
    market_band_updates: output.market_band_updates,
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
