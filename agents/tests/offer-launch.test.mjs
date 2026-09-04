import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLaunchCandidate, selectLaunchCandidate, launchDecision } from '../lib/offer-launch.mjs';

const candidate = { shopifyId:1,status:'draft',price:59.99,landedCost:12,stock:50,deliveryMax:10,lastVerifiedOn:'2026-09-03',orders:500,competition:{saturated:false},title:'Gift set' };
test('launch candidate must pass supplier, delivery, demand, and margin gates', () => {
  const result=evaluateLaunchCandidate(candidate,{now:new Date('2026-09-03T12:00:00Z'),limits:{minimum_contribution_margin_rate:.3,maximum_refund_rate:.08}});
  assert.equal(result.eligible,true); assert.equal(Object.values(result.gates).every(Boolean),true);
  assert.equal(evaluateLaunchCandidate({...candidate,status:'active'},{now:new Date('2026-09-03T12:00:00Z')}).eligible,false);
});
test('candidate selector takes the highest evidence-weighted eligible offer', () => {
  const selected=selectLaunchCandidate([candidate,{...candidate,shopifyId:2,deliveryMax:25,orders:60}],{now:new Date('2026-09-03T12:00:00Z')});
  assert.equal(selected.candidate.shopifyId,1);
});
test('launch decision scales profit and kills proven non-conversion', () => {
  assert.equal(launchDecision({sessions:100,orders:5,fulfilledOrders:5,contributionProfit:80}).status,'scale');
  assert.equal(launchDecision({sessions:150,orders:0,contributionProfit:0}).status,'kill');
  assert.equal(launchDecision({sessions:40,orders:0,contributionProfit:0}).status,'testing');
});
