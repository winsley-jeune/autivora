#!/usr/bin/env node
// Alibaba is an RFQ/sample lane, not an AliExpress-style instant-fulfillment API. This intake
// converts the existing seed URLs plus supplier quotations into deterministic test/no-test
// decisions. Suppliers remain approval-gated; no message or purchase is sent automatically.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { keywordOverview, googleShoppingProducts } from '../lib/dataforseo.mjs';
import { estimateAlibabaEconomics, parseAlibabaEvidence, prequalifyAlibaba } from './lib/alibaba-market.mjs';
import { amazonHuntEconomics, autivaraHuntEconomics } from './lib/channel-hunt.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const seedsPath = join(root, 'product-pipeline', 'raw', 'candidates.csv');
const liveDiscoveryPath = join(root, 'product-pipeline', 'raw', 'alibaba-live-discovery.json');
const quotesPath = join(root, 'product-pipeline', 'raw', 'alibaba-quotes.csv');
const outputPath = join(here, 'output', 'alibaba-intake-latest.json');
// Operator policy: never send more than two Alibaba listing requests in one run. An environment
// override may lower the cap for testing, but cannot raise it.
export const ALIBABA_REQUEST_LIMIT = Math.min(2, Math.max(1, Number(process.env.ALIBABA_SCAN_LIMIT ?? 2)));

export function csvRows(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(',');
  return lines.map((line) => {
    const values = [];
    let value = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"' && line[i + 1] === '"' && quoted) { value += '"'; i += 1; }
      else if (char === '"') quoted = !quoted;
      else if (char === ',' && !quoted) { values.push(value); value = ''; }
      else value += char;
    }
    values.push(value);
    return Object.fromEntries(headers.map((header, index) => [header.trim(), values[index]?.trim() ?? '']));
  });
}

const number = (value) => value === '' || value == null ? null : Number(value);
const yes = (value) => /^(yes|true|1)$/i.test(value ?? '');

export function evaluateAlibabaCandidate(seed, quote = {}) {
  const unitCost = number(quote.unit_cost);
  const shipping = number(quote.shipping_per_unit);
  const retail = number(quote.target_retail);
  const moq = number(quote.moq);
  const sampleCost = number(quote.sample_cost);
  const deliveryDays = number(quote.delivery_days);
  const landedCost = unitCost == null || shipping == null ? null : unitCost + shipping;
  const contributionMargin = landedCost == null || retail == null || retail <= 0
    ? null
    : (retail - landedCost - retail * 0.03) / retail;

  const missing = [
    ['unit_cost', unitCost], ['shipping_per_unit', shipping], ['target_retail', retail],
    ['moq', moq], ['sample_cost', sampleCost], ['delivery_days', deliveryDays],
  ].filter(([, value]) => value == null).map(([field]) => field);
  const blockers = [];
  if (!yes(quote.trade_assurance)) blockers.push('trade_assurance_required');
  if (!yes(quote.supplier_verified)) blockers.push('verified_supplier_required');
  if (deliveryDays != null && deliveryDays > 30) blockers.push('delivery_above_30_days');
  if (contributionMargin != null && contributionMargin < 0.3) blockers.push('contribution_margin_below_30pct');

  return {
    alibabaId: seed.alibaba_id,
    title: seed.slug,
    inferredType: seed.inferred_type,
    url: seed.url,
    status: missing.length ? 'needs_quote' : blockers.length ? 'reject' : 'sample_ready',
    missing,
    blockers,
    economics: { unitCost, shippingPerUnit: shipping, landedCost, targetRetail: retail, contributionMargin },
    test: { moq, sampleCost, deliveryDays, dropshipSupported: yes(quote.dropship_supported) },
  };
}

export function buildAlibabaIntake(seeds, quotes) {
  const byId = new Map(quotes.map((quote) => [String(quote.alibaba_id), quote]));
  const candidates = seeds.map((seed) => evaluateAlibabaCandidate(seed, byId.get(String(seed.alibaba_id))));
  return {
    generatedAt: new Date().toISOString(),
    mode: 'rfq-and-sample',
    counts: Object.fromEntries(['needs_quote', 'sample_ready', 'reject'].map((status) => [status, candidates.filter((item) => item.status === status).length])),
    candidates,
    nextAction: candidates.some((item) => item.status === 'sample_ready')
      ? 'Order one approved sample and verify product quality before creating a Shopify draft.'
      : `Complete ${quotesPath} with supplier RFQ responses. No supplier outreach or purchase is automated.`,
  };
}

export function mergeAlibabaSeeds(manualSeeds, liveDiscovery = {}) {
  const merged = new Map();
  const liveSeeds = (liveDiscovery.candidates ?? []).map((seed) => ({
    ...seed, observed_at: seed.observed_at ?? liveDiscovery.generatedAt ?? null,
  }));
  for (const seed of [...manualSeeds, ...liveSeeds]) {
    const id = String(seed.alibaba_id ?? '').trim();
    if (id) merged.set(id, { ...seed, alibaba_id: id });
  }
  return [...merged.values()];
}

export function seedListingEvidence(seed) {
  const priceLow = number(seed.advertised_price_low);
  const priceHigh = number(seed.advertised_price_high);
  const moq = number(seed.advertised_moq);
  if (!(priceLow > 0) || !(priceHigh > 0) || !(moq > 0)) return null;
  return {
    source: 'authenticated-browser', blocked: false, priceLow, priceHigh, moq,
    supplier: seed.supplier ?? null, signals: seed.signals ?? [], observedAt: seed.observed_at ?? null,
  };
}

export function categoryCohorts(seeds) {
  const groups = new Map();
  for (const seed of seeds) {
    if (!seed.category_cohort) continue;
    if (!groups.has(seed.category_cohort)) groups.set(seed.category_cohort, []);
    groups.get(seed.category_cohort).push(String(seed.alibaba_id));
  }
  return [...groups].map(([category, productIds]) => ({
    category, productIds, deviceCount: productIds.length,
    status: productIds.length >= 5 && productIds.length <= 7 ? 'cohort_ready' : 'building',
  }));
}

export function evaluateChannelHunts(seed, economics) {
  return {
    amazon: amazonHuntEconomics({
      sellingPrice: economics?.targetRetail, landedCost: economics?.landedHigh,
      referralFeeRate: seed.amazon_referral_fee_rate, fbaFee: seed.amazon_fba_fee,
      storagePerUnit: seed.amazon_storage_per_unit, ppcCpc: seed.amazon_ppc_cpc,
      ppcConversionRate: seed.amazon_ppc_conversion_rate,
      privateLabelPossible: seed.private_label_possible === true,
      monthlyUnitPotential: seed.amazon_monthly_unit_potential,
    }),
    autivara: autivaraHuntEconomics({
      sellingPrice: economics?.targetRetail, landedCost: economics?.landedHigh,
      fulfillmentPerUnit: seed.autivara_fulfillment_per_unit,
      paymentFeeRate: seed.autivara_payment_fee_rate,
      blendedCac: seed.autivara_blended_cac,
      privateLabelPossible: seed.private_label_possible === true,
      organicDemandEvidence: seed.autivara_organic_demand_evidence === true,
      paidAcquisitionEvidence: seed.autivara_paid_acquisition_evidence === true,
    }),
  };
}

const DEMAND_QUERIES = {
  'home/commercial': 'scent diffuser machine',
  'passive-car-vent': 'car vent air freshener',
  'electric-car-diffuser': 'electric car diffuser',
  'electric-spin-scrubber': 'electric spin scrubber',
  'pet-hair-remover': 'reusable pet hair remover',
  'smart-pet-feeder': 'smart pet feeder',
  'pet-gps-tracker': 'pet gps tracker',
  'smart-pet-fountain': 'smart pet water fountain',
  'interactive-pet-toy': 'interactive cat ball',
  'ambiguous': 'home fragrance diffuser',
};
export const demandQuery = (seed) => DEMAND_QUERIES[seed.inferred_type]
  ?? String(seed.slug).replace(/\b(2025|new|style|top|sale|custom|wholesale)\b/gi, ' ').replace(/[-_/]+/g, ' ').replace(/\s+/g, ' ').trim();

async function fetchPublicListing(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AutivaraProductResearch/1.0; +https://autivara.com)' },
      redirect: 'follow', signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) return { source: 'listing', blocked: true, httpStatus: response.status, priceLow: null, priceHigh: null, moq: null };
    return { ...parseAlibabaEvidence(await response.text(), 'listing'), httpStatus: response.status };
  } catch (error) {
    return { source: 'listing', blocked: true, error: error.message, priceLow: null, priceHigh: null, moq: null };
  }
}

export async function researchAlibabaCandidates(seeds, {
  prior = null, fetchListing = fetchPublicListing,
  demandLoader = keywordOverview, shoppingLoader = googleShoppingProducts,
} = {}) {
  const previous = new Map((prior?.research ?? []).map((item) => [String(item.alibabaId), item]));
  const cursor = Number(prior?.nextCursor ?? 0) % Math.max(1, seeds.length);
  const batch = Array.from({ length: Math.min(ALIBABA_REQUEST_LIMIT, seeds.length) }, (_, offset) => seeds[(cursor + offset) % seeds.length]);
  const overview = await demandLoader(batch.map(demandQuery)) ?? [];
  const demandByKeyword = new Map(overview.map((item) => [item.keyword.toLowerCase(), item]));

  const attempted = [];
  const accessChallenges = (prior?.accessChallenges ?? []).filter((item) =>
    seeds.some((seed) => String(seed.alibaba_id) === String(item.alibabaId)),
  );
  let operatorAction = null;
  for (const seed of batch) {
    const evidence = seedListingEvidence(seed) ?? await fetchListing(seed.url);
    attempted.push(seed);
    const query = demandQuery(seed);
    const demand = demandByKeyword.get(query.toLowerCase()) ?? { keyword: query, volume: 0, cpc: null, competition: null, intent: null };
    let shopping = [];
    if (evidence.priceHigh > 0 && evidence.moq > 0 && demand.volume > 0) shopping = await shoppingLoader(query, { depth: 20 }) ?? [];
    const marketplacePrices = shopping.map((item) => item.price).filter((price) => Number.isFinite(Number(price))).map(Number);
    const economics = estimateAlibabaEconomics(evidence, marketplacePrices, demand);
    const decision = prequalifyAlibaba({ evidence, economics, demand });
    const channelHunt = evaluateChannelHunts(seed, economics);
    previous.set(String(seed.alibaba_id), {
      alibabaId: seed.alibaba_id, title: seed.slug, inferredType: seed.inferred_type, url: seed.url,
      observedAt: new Date().toISOString(), query, evidence, demand,
      marketplace: { source: 'google-shopping-dataforseo', comparableCount: marketplacePrices.length, prices: marketplacePrices.slice(0, 20) },
      economics, channelHunt, ...decision,
    });
    if (evidence.blocked) {
      operatorAction = { type: 'alibaba_access_challenge', url: seed.url, alibabaId: seed.alibaba_id, observedAt: new Date().toISOString(), message: 'Open this URL in authenticated Chrome and complete Alibaba verification, then rerun.' };
      const existing = accessChallenges.findIndex((item) => String(item.alibabaId) === String(seed.alibaba_id));
      if (existing >= 0) accessChallenges[existing] = operatorAction;
      else accessChallenges.push(operatorAction);
      break;
    }
  }
  const research = seeds.map((seed) => previous.get(String(seed.alibaba_id))).filter(Boolean);
  return {
    research, scanned: attempted.length,
    // A challenged listing is queued for authenticated verification, but must not pin the
    // catalog cursor and prevent every later candidate from being researched.
    nextCursor: (cursor + attempted.length) % Math.max(1, seeds.length),
    operatorAction, accessChallenges,
    counts: Object.fromEntries(['prequalified', 'needs_evidence', 'listing_data_blocked', 'reject_preliminary'].map((status) => [status, research.filter((item) => item.status === status).length])),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const manualSeeds = csvRows(readFileSync(seedsPath, 'utf8'));
  let liveDiscovery = {};
  try { liveDiscovery = JSON.parse(readFileSync(liveDiscoveryPath, 'utf8')); } catch {}
  const seeds = mergeAlibabaSeeds(manualSeeds, liveDiscovery);
  const quotes = existsSync(quotesPath) ? csvRows(readFileSync(quotesPath, 'utf8')) : [];
  let prior = null;
  try { prior = JSON.parse(readFileSync(outputPath, 'utf8')); } catch {}
  const preliminary = process.argv.includes('--quotes-only') ? { research: prior?.research ?? [], counts: prior?.preliminaryCounts ?? {}, nextCursor: prior?.nextCursor ?? 0, scanned: 0, operatorAction: prior?.operatorAction ?? null, accessChallenges: prior?.accessChallenges ?? [] } : await researchAlibabaCandidates(seeds, { prior });
  const quoted = buildAlibabaIntake(seeds, quotes);
  const report = {
    ...quoted, research: preliminary.research, preliminaryCounts: preliminary.counts,
    scannedThisRun: preliminary.scanned, nextCursor: preliminary.nextCursor, operatorAction: preliminary.operatorAction, accessChallenges: preliminary.accessChallenges,
    categoryCohorts: categoryCohorts(seeds),
    supervision: {
      mode: 'supervised-autonomous-research', scheduledStage: 'alibaba-research', alibabaRequestLimit: ALIBABA_REQUEST_LIMIT,
      automaticActions: ['scan', 'extract', 'measure-demand', 'compare-marketplace', 'estimate-economics', 'rank'],
      approvalRequired: ['supplier-contact', 'sample-order', 'inventory-purchase', 'shopify-publication'],
      policy: 'MOQ is evaluated through profit and demand-adjusted sell-through; it is not a numeric hard blocker.',
      seedSources: { manual: manualSeeds.length, live: liveDiscovery.candidates?.length ?? 0, merged: seeds.length },
    },
  };
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Alibaba intake: ${report.counts.sample_ready} sample-ready, ${report.counts.needs_quote} need quotes, ${report.counts.reject} rejected.`);
  console.log(`Alibaba research: scanned ${report.scannedThisRun}; ${report.preliminaryCounts.prequalified ?? 0} prequalified, ${report.preliminaryCounts.listing_data_blocked ?? 0} listing-data blocked.`);
  if (report.operatorAction) {
    console.warn(`ACTION REQUIRED: ${report.operatorAction.message} ${report.operatorAction.url}`);
    try {
      execFileSync('osascript', ['-e', `display notification ${JSON.stringify(report.operatorAction.message)} with title "Autivara — Alibaba access required" sound name "Glass"`]);
    } catch {}
  }
  console.log(`Saved -> ${outputPath.slice(root.length + 1)}`);
}
