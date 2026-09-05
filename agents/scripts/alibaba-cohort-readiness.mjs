#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { calculateUnitEconomics } from "../lib/profit-control.mjs";

export function assessCandidate(candidate) {
  const stages = {
    supplier: Boolean(candidate.supplier?.name && candidate.supplier?.url && candidate.supplier?.image && candidate.supplier?.verifiedAt),
    demand: candidate.market?.intent === "transactional" && Number(candidate.market?.monthlySearchVolume) > 0
      && Number(candidate.market?.shoppingComparables) >= 5,
    logistics: Number(candidate.logistics?.shippingPerUnit) > 0 && Number(candidate.logistics?.deliveryMinDays) > 0
      && Number(candidate.logistics?.deliveryMaxDays) > 0 && Number(candidate.logistics?.deliveryMaxDays) <= 30,
    offer: Boolean(candidate.offer?.title && candidate.offer?.targetRetail > 0),
  };
  let economics = null;
  if (stages.logistics && stages.offer) {
    economics = calculateUnitEconomics({
      productKey: candidate.alibabaId,
      sellingPrice: candidate.offer.targetRetail,
      supplierCost: candidate.supplier.unitPrice,
      shippingCost: candidate.logistics.shippingPerUnit,
      landedCost: Number(candidate.supplier.unitPrice) + Number(candidate.logistics.shippingPerUnit),
      fulfillmentCost: candidate.offer.fulfillmentCost,
      paymentFeeRate: 0.029,
      paymentFeeFixed: 0.30,
      expectedRefundRate: 0.08,
    });
  }
  stages.margin = economics?.passesMarginGate === true;
  stages.creatives = Array.isArray(candidate.assets?.generated) && candidate.assets.generated.length >= 3;
  const blockers = [];
  if (!stages.supplier) blockers.push("supplier_evidence_missing");
  if (!stages.demand) blockers.push("transactional_demand_missing");
  if (!stages.logistics) blockers.push("shipping_or_delivery_quote_missing");
  if (!stages.offer) blockers.push("offer_copy_missing");
  if (economics && !stages.margin) blockers.push("contribution_margin_below_30pct");
  if (!stages.creatives) blockers.push("grounded_creatives_not_generated");
  return { alibabaId: candidate.alibabaId, role: candidate.role, product: candidate.product,
    status: blockers.length ? "blocked_before_shopify" : "ready_for_shopify_draft", stages, blockers, economics };
}

export function assessCohort(cohort) {
  const candidates = cohort.candidates.map(assessCandidate);
  return { generatedAt: new Date().toISOString(), category: cohort.category,
    counts: { total: candidates.length, ready: candidates.filter((x) => x.status === "ready_for_shopify_draft").length,
      blocked: candidates.filter((x) => x.status !== "ready_for_shopify_draft").length }, candidates };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) throw new Error("Usage: node agents/scripts/alibaba-cohort-readiness.mjs <cohort.json>");
  console.log(JSON.stringify(assessCohort(JSON.parse(readFileSync(resolve(path), "utf8"))), null, 2));
}
