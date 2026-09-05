#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { calculateUnitEconomics } from "../lib/profit-control.mjs";

export function assessCandidate(candidate) {
  const deliveryMinDays = Number(candidate.logistics?.deliveryMinDays);
  const deliveryMaxDays = Number(candidate.logistics?.deliveryMaxDays);
  const deliveryKnown = deliveryMinDays > 0 && deliveryMaxDays > 0;
  const deliveryUnconfirmed = candidate.logistics?.deliveryStatus === "unconfirmed";
  const stages = {
    supplier: Boolean(candidate.supplier?.name && candidate.supplier?.url && candidate.supplier?.image && candidate.supplier?.verifiedAt),
    demand: candidate.market?.intent === "transactional" && Number(candidate.market?.monthlySearchVolume) > 0
      && Number(candidate.market?.shoppingComparables) >= 5,
    freight: Number(candidate.logistics?.shippingPerUnit) > 0,
    delivery: deliveryKnown && deliveryMaxDays <= 30,
    deliveryDisclosure: deliveryUnconfirmed,
    offer: Boolean(candidate.offer?.title && candidate.offer?.targetRetail > 0),
  };
  let economics = null;
  stages.logistics = stages.freight && (stages.delivery || stages.deliveryDisclosure);
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
  if (!stages.freight) blockers.push("shipping_cost_missing");
  if (!stages.delivery && !stages.deliveryDisclosure) blockers.push("delivery_evidence_or_disclosure_missing");
  if (!stages.offer) blockers.push("offer_copy_missing");
  if (economics && !stages.margin) blockers.push("contribution_margin_below_30pct");
  if (!stages.creatives) blockers.push("grounded_creatives_not_generated");
  const status = blockers.length ? "blocked_before_shopify"
    : stages.deliveryDisclosure ? "ready_for_shopify_draft_with_delivery_disclosure" : "ready_for_shopify_draft";
  return { alibabaId: candidate.alibabaId, role: candidate.role, product: candidate.product,
    status, stages, blockers, economics };
}

export function assessCohort(cohort) {
  const candidates = cohort.candidates.map(assessCandidate);
  return { generatedAt: new Date().toISOString(), category: cohort.category,
    counts: { total: candidates.length, ready: candidates.filter((x) => x.status.startsWith("ready_for_shopify")).length,
      deliveryDisclosure: candidates.filter((x) => x.status.endsWith("delivery_disclosure")).length,
      blocked: candidates.filter((x) => !x.status.startsWith("ready_for_shopify")).length }, candidates };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) throw new Error("Usage: node agents/scripts/alibaba-cohort-readiness.mjs <cohort.json>");
  console.log(JSON.stringify(assessCohort(JSON.parse(readFileSync(resolve(path), "utf8"))), null, 2));
}
