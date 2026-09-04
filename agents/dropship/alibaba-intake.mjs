#!/usr/bin/env node
// Alibaba is an RFQ/sample lane, not an AliExpress-style instant-fulfillment API. This intake
// converts the existing seed URLs plus supplier quotations into deterministic test/no-test
// decisions. Suppliers remain approval-gated; no message or purchase is sent automatically.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const seedsPath = join(root, 'product-pipeline', 'raw', 'candidates.csv');
const quotesPath = join(root, 'product-pipeline', 'raw', 'alibaba-quotes.csv');
const outputPath = join(here, 'output', 'alibaba-intake-latest.json');

function csvRows(text) {
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
  if (moq != null && moq > 20) blockers.push('test_moq_above_20');
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

if (import.meta.url === `file://${process.argv[1]}`) {
  const seeds = csvRows(readFileSync(seedsPath, 'utf8'));
  const quotes = existsSync(quotesPath) ? csvRows(readFileSync(quotesPath, 'utf8')) : [];
  const report = buildAlibabaIntake(seeds, quotes);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Alibaba intake: ${report.counts.sample_ready} sample-ready, ${report.counts.needs_quote} need quotes, ${report.counts.reject} rejected.`);
  console.log(`Saved -> ${outputPath.slice(root.length + 1)}`);
}
