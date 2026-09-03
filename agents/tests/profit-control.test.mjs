import test from "node:test";
import assert from "node:assert/strict";
import { calculateUnitEconomics, scoreOpportunity, decideExperiment } from "../lib/profit-control.mjs";

test("unit economics fail closed when landed costs are missing", () => {
  assert.deepEqual(calculateUnitEconomics({ productKey:"x", sellingPrice:49, supplierCost:12 }), { complete:false, missing:["shippingCost"], productKey:"x" });
});

test("unit economics calculate contribution and allowable CAC", () => {
  const x = calculateUnitEconomics({ productKey:"x", sellingPrice:50, supplierCost:10, shippingCost:5, paymentFeeRate:0.03, paymentFeeFixed:0.5, expectedRefundRate:0.05 }, { minimum_contribution_margin_rate:0.3 });
  assert.equal(x.contributionProfit,30.5); assert.equal(x.contributionMarginRate,0.61); assert.equal(x.allowableCac,15.5); assert.equal(x.passesMarginGate,true);
});

test("opportunity score rejects an unprofitable offer", () => {
  assert.equal(scoreOpportunity({ economics:{ complete:true, passesMarginGate:false } }).eligible,false);
});

test("experiment waits for samples then retains profitable lift", () => {
  const experiment={minimumSessions:100,minimumConversions:5,minimumLift:0.1};
  assert.equal(decideExperiment({experiment,control:{complete:1,sessions:20,conversions:1,contribution_profit:10},variant:{complete:1,sessions:20,conversions:1,contribution_profit:20}}).status,"running");
  assert.equal(decideExperiment({experiment,control:{complete:1,sessions:100,conversions:3,contribution_profit:50},variant:{complete:1,sessions:100,conversions:4,contribution_profit:70}}).status,"retain");
});

test("experiment reverts a contribution-profit loss", () => {
  const result=decideExperiment({experiment:{minimumSessions:100,minimumConversions:5,minimumLift:0.1},control:{complete:1,sessions:100,conversions:4,contribution_profit:50},variant:{complete:1,sessions:100,conversions:3,contribution_profit:20}});
  assert.equal(result.status,"revert");
});
