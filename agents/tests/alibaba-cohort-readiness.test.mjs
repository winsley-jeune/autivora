import test from "node:test";
import assert from "node:assert/strict";
import { assessCandidate } from "../scripts/alibaba-cohort-readiness.mjs";

const candidate = { alibabaId:"1",role:"core",product:"Device",supplier:{name:"S",url:"https://alibaba.com/x",image:"https://alicdn.com/x.jpg",verifiedAt:"2026-09-05",unitPrice:20},market:{intent:"transactional",monthlySearchVolume:100,shoppingComparables:10},logistics:{shippingPerUnit:5,deliveryMinDays:8,deliveryMaxDays:10},offer:{title:"Device",targetRetail:79.99,fulfillmentCost:6},assets:{generated:["a","b","c"]} };

test("cohort readiness passes a fully evidenced profitable product", () => {
  assert.equal(assessCandidate(candidate).status, "ready_for_shopify_draft");
});

test("cohort readiness stops before Shopify when freight is unknown", () => {
  const result = assessCandidate({ ...candidate, logistics:{} });
  assert.equal(result.status, "blocked_before_shopify");
  assert.ok(result.blockers.includes("shipping_or_delivery_quote_missing"));
});
