import test from 'node:test';
import assert from 'node:assert/strict';
import { amazonHuntEconomics, autivaraHuntEconomics } from '../dropship/lib/channel-hunt.mjs';
import { evaluateChannelHunts } from '../dropship/alibaba-intake.mjs';

test('Amazon hunt requires private label, 10k monthly potential, and 30 percent after 50 percent reserve', () => {
  const winner = amazonHuntEconomics({
    sellingPrice: 50, landedCost: 9, referralFeeRate: 0.15, fbaFee: 5,
    storagePerUnit: 0.5, ppcCpc: 1, ppcConversionRate: 0.10,
    privateLabelPossible: true, monthlyUnitPotential: 10_000,
  });
  assert.equal(winner.eligible, true);
  assert.equal(winner.amazonCostReserve, 25);
  assert.equal(winner.netMarginRate, 0.32);
  assert.equal(amazonHuntEconomics({ ...winner, sellingPrice: 50, landedCost: 11, referralFeeRate: .15, fbaFee: 5, storagePerUnit: .5, ppcCpc: 1, ppcConversionRate: .1, privateLabelPossible: true, monthlyUnitPotential: 10_000 }).eligible, false);
});

test('Amazon hunt rejects demand below ten thousand monthly units', () => {
  const result = amazonHuntEconomics({ sellingPrice: 100, landedCost: 10, referralFeeRate: .15, fbaFee: 5, storagePerUnit: 1, ppcCpc: 1, ppcConversionRate: .1, privateLabelPossible: true, monthlyUnitPotential: 9_999 });
  assert.ok(result.blockers.includes('monthly_10k_unit_potential_not_proven'));
});

test('Autivara hunt retains 30 percent after fulfillment and blended acquisition cost', () => {
  const result = autivaraHuntEconomics({ sellingPrice: 80, landedCost: 16, fulfillmentPerUnit: 8, paymentFeeRate: .03, blendedCac: 20, privateLabelPossible: true, organicDemandEvidence: true });
  assert.equal(result.eligible, true);
  assert.equal(result.netMarginRate, 0.42);
  assert.equal(autivaraHuntEconomics({ sellingPrice: 80, landedCost: 16, fulfillmentPerUnit: 8, blendedCac: 40, privateLabelPossible: true, organicDemandEvidence: true }).eligible, false);
});

test('Alibaba candidates fail closed for both channels until channel-specific evidence exists', () => {
  const result = evaluateChannelHunts({}, { targetRetail: 50, landedHigh: 10 });
  assert.equal(result.amazon.complete, false);
  assert.equal(result.autivara.complete, false);
});
