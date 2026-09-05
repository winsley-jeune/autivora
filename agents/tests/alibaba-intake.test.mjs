import test from 'node:test';
import assert from 'node:assert/strict';
import { ALIBABA_REQUEST_LIMIT, categoryCohorts, demandQuery, evaluateAlibabaCandidate, mergeAlibabaSeeds, researchAlibabaCandidates, seedListingEvidence } from '../dropship/alibaba-intake.mjs';
import { discoveryPage } from '../dropship/run.mjs';
import { estimateAlibabaEconomics, parseAlibabaEvidence, prequalifyAlibaba } from '../dropship/lib/alibaba-market.mjs';

const seed = { alibaba_id: '1', slug: 'Design-led product', inferred_type: 'home', url: 'https://www.alibaba.com/product-detail/example_1.html' };

test('Alibaba intake waits for a complete supplier quote', () => {
  const result = evaluateAlibabaCandidate(seed, {});
  assert.equal(result.status, 'needs_quote');
  assert.ok(result.missing.includes('unit_cost'));
});

test('Alibaba live discovery expands and deduplicates the manually seeded catalog', () => {
  const manual = [{ alibaba_id: '1', slug: 'manual', url: 'https://www.alibaba.com/1' }];
  const live = { candidates: [
    { alibaba_id: '1', slug: 'live refresh', url: 'https://www.alibaba.com/live-1' },
    { alibaba_id: '2', slug: 'new live product', url: 'https://www.alibaba.com/live-2' },
  ] };
  const merged = mergeAlibabaSeeds(manual, live);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].slug, 'live refresh');
  assert.equal(merged[1].slug, 'new live product');
});

test('Alibaba live browser evidence bypasses a redundant blocked server fetch', async () => {
  const liveSeed = {
    alibaba_id: '2', slug: 'new live product', inferred_type: 'car-safety', url: 'https://www.alibaba.com/live-2',
    advertised_price_low: 5, advertised_price_high: 7, advertised_moq: 10,
    supplier: 'Verified Co.', signals: ['easy return'],
  };
  assert.deepEqual(seedListingEvidence(liveSeed), {
    source: 'authenticated-browser', blocked: false, priceLow: 5, priceHigh: 7, moq: 10,
    supplier: 'Verified Co.', signals: ['easy return'], observedAt: null,
  });
  let fetches = 0;
  const result = await researchAlibabaCandidates([liveSeed], {
    fetchListing: async () => { fetches += 1; return { blocked: true }; },
    demandLoader: async () => [{ keyword: 'new live product', volume: 100, cpc: 1, competition: 'MEDIUM' }],
    shoppingLoader: async () => [{ price: 49 }],
  });
  assert.equal(fetches, 0);
  assert.equal(result.research[0].evidence.source, 'authenticated-browser');
  assert.equal(result.operatorAction, null);
});

test('Alibaba category cohorts require five to seven distinct devices', () => {
  const seeds = Array.from({ length: 7 }, (_, index) => ({ alibaba_id: String(index + 1), category_cohort: 'smart-pet-care' }));
  assert.equal(categoryCohorts(seeds)[0].status, 'cohort_ready');
  assert.equal(categoryCohorts(seeds.slice(0, 4))[0].status, 'building');
  assert.equal(categoryCohorts([...seeds, { alibaba_id: '8', category_cohort: 'smart-pet-care' }])[0].status, 'building');
});

test('Alibaba intake accepts a low-MOQ profitable sample', () => {
  const result = evaluateAlibabaCandidate(seed, {
    unit_cost: '20', shipping_per_unit: '5', target_retail: '79', moq: '10',
    sample_cost: '35', delivery_days: '14', dropship_supported: 'no',
    trade_assurance: 'yes', supplier_verified: 'yes',
  });
  assert.equal(result.status, 'sample_ready');
  assert.ok(result.economics.contributionMargin >= 0.3);
});

test('Alibaba intake rejects unsafe or unprofitable quotes', () => {
  const result = evaluateAlibabaCandidate(seed, {
    unit_cost: '50', shipping_per_unit: '20', target_retail: '79', moq: '100',
    sample_cost: '75', delivery_days: '45', dropship_supported: 'no',
    trade_assurance: 'no', supplier_verified: 'no',
  });
  assert.equal(result.status, 'reject');
  assert.ok(result.blockers.includes('contribution_margin_below_30pct'));
  assert.ok(result.blockers.includes('trade_assurance_required'));
});

test('Alibaba formal quote does not reject a product solely because MOQ is high', () => {
  const result = evaluateAlibabaCandidate(seed, {
    unit_cost: '4', shipping_per_unit: '3', target_retail: '39', moq: '500',
    sample_cost: '15', delivery_days: '20', dropship_supported: 'no',
    trade_assurance: 'yes', supplier_verified: 'yes',
  });
  assert.equal(result.status, 'sample_ready');
  assert.ok(!result.blockers.some((item) => item.includes('moq')));
});

test('AliExpress discovery rotates beyond saturated first-page listings', () => {
  assert.equal(discoveryPage(undefined), 1);
  assert.equal(discoveryPage({ scans: 1 }), 2);
  assert.equal(discoveryPage({ scans: 4 }), 5);
  assert.equal(discoveryPage({ scans: 5 }), 1);
});

test('Alibaba evidence parser reads advertised range and MOQ without choosing the teaser price alone', () => {
  const result = parseAlibabaEvidence('<div>US $3.20 - $7.80</div><span>Min. Order: 10 pieces</span><b>Trade Assurance</b>');
  assert.deepEqual({ low: result.priceLow, high: result.priceHigh, moq: result.moq }, { low: 3.2, high: 7.8, moq: 10 });
  assert.equal(result.tradeAssuranceAdvertised, true);
});

test('Alibaba parser refuses anti-bot challenge pages as product evidence', () => {
  const result = parseAlibabaEvidence('<punish-component>Captcha Intercept unusual traffic</punish-component>');
  assert.equal(result.blocked, true);
  assert.equal(result.priceHigh, null);
});

test('Alibaba preliminary economics use high advertised cost and marketplace median', () => {
  const evidence = { priceLow: 5, priceHigh: 9, moq: 10 };
  const economics = estimateAlibabaEconomics(evidence, [39, 49, 59], { volume: 500, competition: 'MEDIUM' });
  assert.equal(economics.unitCostHigh, 9);
  assert.equal(economics.marketMedian, 49);
  assert.equal(economics.estimateOnly, true);
  assert.ok(economics.landedHigh > economics.unitCostHigh);
  assert.equal(prequalifyAlibaba({ evidence, economics, demand: { volume: 500, cpc: 1.5 } }).status, 'prequalified');
});

test('Alibaba MOQ is accepted when measured demand can sell it profitably', () => {
  const evidence = { priceLow: 4, priceHigh: 6, moq: 500 };
  const demand = { volume: 10000, cpc: 2, competition: 'MEDIUM' };
  const economics = estimateAlibabaEconomics(evidence, [35, 39, 45], demand);
  const result = prequalifyAlibaba({ evidence, economics, demand });
  assert.equal(result.status, 'prequalified');
  assert.ok(economics.totalContributionAtSellThrough > 0);
  assert.ok(economics.sellThroughMonths < 12);
  assert.ok(!result.blockers.some((item) => item.includes('moq_above')));
});

test('Alibaba MOQ is rejected only when demand implies excessive sell-through time', () => {
  const evidence = { priceLow: 4, priceHigh: 6, moq: 500 };
  const demand = { volume: 50, cpc: 0.2, competition: 'HIGH' };
  const economics = estimateAlibabaEconomics(evidence, [35, 39, 45], demand);
  const result = prequalifyAlibaba({ evidence, economics, demand });
  assert.equal(result.status, 'reject_preliminary');
  assert.ok(result.blockers.includes('moq_exceeds_12_month_demand'));
});

test('Alibaba margin range that crosses 30 percent requests shipping evidence instead of rejecting', () => {
  const evidence = { priceLow: 23, priceHigh: 23, moq: 1 };
  const demand = { volume: 90, cpc: 2.02, competition: 'HIGH' };
  const economics = estimateAlibabaEconomics(evidence, [59], demand);
  const result = prequalifyAlibaba({ evidence, economics, demand });
  assert.equal(result.status, 'needs_evidence');
  assert.ok(result.blockers.includes('shipping_quote_required_for_margin'));
  assert.ok(!result.blockers.includes('estimated_margin_below_30pct'));
});

test('Alibaba demand research translates internal categories into buyer language', () => {
  assert.equal(demandQuery({ inferred_type: 'home/commercial', slug: 'ignored' }), 'scent diffuser machine');
  assert.equal(demandQuery({ inferred_type: 'passive-car-vent', slug: 'ignored' }), 'car vent air freshener');
  assert.equal(demandQuery({ inferred_type: 'electric-spin-scrubber', slug: 'ignored' }), 'electric spin scrubber');
  assert.equal(demandQuery({ inferred_type: 'pet-hair-remover', slug: 'ignored' }), 'reusable pet hair remover');
  assert.equal(demandQuery({ inferred_type: 'smart-pet-feeder', slug: 'ignored' }), 'smart pet feeder');
  assert.equal(demandQuery({ inferred_type: 'pet-gps-tracker', slug: 'ignored' }), 'pet gps tracker');
  assert.equal(demandQuery({ inferred_type: 'smart-pet-fountain', slug: 'ignored' }), 'smart pet water fountain');
  assert.equal(demandQuery({ inferred_type: 'interactive-pet-toy', slug: 'ignored' }), 'interactive cat ball');
});

test('Alibaba research caps direct requests, queues a challenge, and advances the catalog cursor', async () => {
  assert.equal(ALIBABA_REQUEST_LIMIT, 2);
  const seeds = [
    { alibaba_id: '1', slug: 'first', inferred_type: 'ambiguous', url: 'https://www.alibaba.com/1' },
    { alibaba_id: '2', slug: 'second', inferred_type: 'ambiguous', url: 'https://www.alibaba.com/2' },
    { alibaba_id: '3', slug: 'third', inferred_type: 'ambiguous', url: 'https://www.alibaba.com/3' },
  ];
  let requests = 0;
  const result = await researchAlibabaCandidates(seeds, {
    fetchListing: async () => { requests += 1; return { blocked: true, priceLow: null, priceHigh: null, moq: null }; },
    demandLoader: async () => [], shoppingLoader: async () => [],
  });
  assert.equal(requests, 1);
  assert.equal(result.scanned, 1);
  assert.equal(result.nextCursor, 1);
  assert.equal(result.operatorAction.type, 'alibaba_access_challenge');
  assert.equal(result.accessChallenges.length, 1);
  assert.equal(result.accessChallenges[0].alibabaId, '1');
});

test('Alibaba research retains earlier access challenges without duplicating them', async () => {
  const prior = {
    nextCursor: 1,
    accessChallenges: [{ type: 'alibaba_access_challenge', alibabaId: '1', url: 'https://www.alibaba.com/1' }],
  };
  const seeds = [
    { alibaba_id: '1', slug: 'first', inferred_type: 'ambiguous', url: 'https://www.alibaba.com/1' },
    { alibaba_id: '2', slug: 'second', inferred_type: 'ambiguous', url: 'https://www.alibaba.com/2' },
  ];
  const result = await researchAlibabaCandidates(seeds, {
    prior,
    fetchListing: async () => ({ blocked: true, priceLow: null, priceHigh: null, moq: null }),
    demandLoader: async () => [], shoppingLoader: async () => [],
  });
  assert.equal(result.nextCursor, 0);
  assert.deepEqual(result.accessChallenges.map((item) => item.alibabaId), ['1', '2']);
});
