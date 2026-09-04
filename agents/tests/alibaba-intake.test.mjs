import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAlibabaCandidate } from '../dropship/alibaba-intake.mjs';
import { discoveryPage } from '../dropship/run.mjs';

const seed = { alibaba_id: '1', slug: 'Design-led product', inferred_type: 'home', url: 'https://www.alibaba.com/product-detail/example_1.html' };

test('Alibaba intake waits for a complete supplier quote', () => {
  const result = evaluateAlibabaCandidate(seed, {});
  assert.equal(result.status, 'needs_quote');
  assert.ok(result.missing.includes('unit_cost'));
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

test('AliExpress discovery rotates beyond saturated first-page listings', () => {
  assert.equal(discoveryPage(undefined), 1);
  assert.equal(discoveryPage({ scans: 1 }), 2);
  assert.equal(discoveryPage({ scans: 4 }), 5);
  assert.equal(discoveryPage({ scans: 5 }), 1);
});
