#!/usr/bin/env node
// Alibaba is an RFQ/sample lane, not an AliExpress-style instant-fulfillment API. This intake
// converts the existing seed URLs plus supplier quotations into deterministic test/no-test
// decisions. Suppliers remain approval-gated; no message or purchase is sent automatically.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { keywordOverview, googleShoppingProducts, serpTop } from '../lib/dataforseo.mjs';
import { estimateAlibabaEconomics, parseAlibabaEvidence, prequalifyAlibaba } from './lib/alibaba-market.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const seedsPath = join(root, 'product-pipeline', 'raw', 'candidates.csv');
const quotesPath = join(root, 'product-pipeline', 'raw', 'alibaba-quotes.csv');
const outputPath = join(here, 'output', 'alibaba-intake-latest.json');
const SCAN_LIMIT = Math.max(1, Number(process.env.ALIBABA_SCAN_LIMIT ?? 5));

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

const DEMAND_QUERIES = {
  'home/commercial': 'scent diffuser machine',
  'passive-car-vent': 'car vent air freshener',
  'electric-car-diffuser': 'electric car diffuser',
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

async function indexedFallback(seed) {
  const results = await serpTop(`site:alibaba.com/product-detail "${seed.slug}"`, { limit: 10 });
  const exact = results?.find((row) => String(row.url).includes(String(seed.alibaba_id)))
    ?? results?.find((row) => /alibaba\.com/i.test(String(row.domain)));
  if (!exact) return null;
  return { ...parseAlibabaEvidence(`${exact.title ?? ''} ${exact.description ?? ''}`, 'dataforseo-indexed-snippet'), indexedUrl: exact.url };
}

export async function researchAlibabaCandidates(seeds, { prior = null } = {}) {
  const previous = new Map((prior?.research ?? []).map((item) => [String(item.alibabaId), item]));
  const cursor = Number(prior?.nextCursor ?? 0) % Math.max(1, seeds.length);
  const batch = Array.from({ length: Math.min(SCAN_LIMIT, seeds.length) }, (_, offset) => seeds[(cursor + offset) % seeds.length]);
  const overview = await keywordOverview(batch.map(demandQuery)) ?? [];
  const demandByKeyword = new Map(overview.map((item) => [item.keyword.toLowerCase(), item]));

  for (const seed of batch) {
    let evidence = await fetchPublicListing(seed.url);
    if (evidence.blocked || !(evidence.priceHigh > 0 && evidence.moq > 0)) {
      const indexed = await indexedFallback(seed);
      if (indexed?.priceHigh > 0 || indexed?.moq > 0) evidence = { ...evidence, ...indexed, blocked: false };
    }
    const query = demandQuery(seed);
    const demand = demandByKeyword.get(query.toLowerCase()) ?? { keyword: query, volume: 0, cpc: null, competition: null, intent: null };
    let shopping = [];
    if (evidence.priceHigh > 0 && evidence.moq > 0 && demand.volume > 0) shopping = await googleShoppingProducts(query, { depth: 20 }) ?? [];
    const marketplacePrices = shopping.map((item) => item.price).filter((price) => Number.isFinite(Number(price))).map(Number);
    const economics = estimateAlibabaEconomics(evidence, marketplacePrices, demand);
    const decision = prequalifyAlibaba({ evidence, economics, demand });
    previous.set(String(seed.alibaba_id), {
      alibabaId: seed.alibaba_id, title: seed.slug, inferredType: seed.inferred_type, url: seed.url,
      observedAt: new Date().toISOString(), query, evidence, demand,
      marketplace: { source: 'google-shopping-dataforseo', comparableCount: marketplacePrices.length, prices: marketplacePrices.slice(0, 20) },
      economics, ...decision,
    });
  }
  const research = seeds.map((seed) => previous.get(String(seed.alibaba_id))).filter(Boolean);
  return {
    research, scanned: batch.length, nextCursor: (cursor + batch.length) % Math.max(1, seeds.length),
    counts: Object.fromEntries(['prequalified', 'needs_evidence', 'listing_data_blocked', 'reject_preliminary'].map((status) => [status, research.filter((item) => item.status === status).length])),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const seeds = csvRows(readFileSync(seedsPath, 'utf8'));
  const quotes = existsSync(quotesPath) ? csvRows(readFileSync(quotesPath, 'utf8')) : [];
  let prior = null;
  try { prior = JSON.parse(readFileSync(outputPath, 'utf8')); } catch {}
  const preliminary = process.argv.includes('--quotes-only') ? { research: prior?.research ?? [], counts: prior?.preliminaryCounts ?? {}, nextCursor: prior?.nextCursor ?? 0, scanned: 0 } : await researchAlibabaCandidates(seeds, { prior });
  const quoted = buildAlibabaIntake(seeds, quotes);
  const report = {
    ...quoted, research: preliminary.research, preliminaryCounts: preliminary.counts,
    scannedThisRun: preliminary.scanned, nextCursor: preliminary.nextCursor,
    supervision: {
      mode: 'autonomous-research', scheduledStage: 'alibaba-research',
      automaticActions: ['scan', 'extract', 'measure-demand', 'compare-marketplace', 'estimate-economics', 'rank'],
      approvalRequired: ['supplier-contact', 'sample-order', 'inventory-purchase', 'shopify-publication'],
      policy: 'MOQ is evaluated through profit and demand-adjusted sell-through; it is not a numeric hard blocker.',
    },
  };
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Alibaba intake: ${report.counts.sample_ready} sample-ready, ${report.counts.needs_quote} need quotes, ${report.counts.reject} rejected.`);
  console.log(`Alibaba research: scanned ${report.scannedThisRun}; ${report.preliminaryCounts.prequalified ?? 0} prequalified, ${report.preliminaryCounts.listing_data_blocked ?? 0} listing-data blocked.`);
  console.log(`Saved -> ${outputPath.slice(root.length + 1)}`);
}
