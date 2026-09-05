import test from "node:test";
import assert from "node:assert/strict";
import { validateAlibabaLaunchDossier } from "../scripts/alibaba-offer-prepare.mjs";

const dossier = { alibabaId:"1", sku:"AB-1", hypothesisId:"h", supplier:{ name:"Supplier", url:"https://www.alibaba.com/product-detail/x_1.html", images:["https://example.com/a.jpg"], evidence:{ verifiedAt:"2026-09-05T00:00:00Z", deliveryMaxDays:9 } }, collection:{handle:"smart-home-atmosphere"}, offer:{title:"Aura",bodyHtml:"<p>Ships in 9 days.</p>",seoTitle:"Aura | Autivara",seoDescription:"A grounded product offer.",productType:"Diffuser"}, economics:{sellingPrice:69.99,supplierCost:17,shippingCost:8,landedCost:25,fulfillmentCost:6,expectedRefundRate:.08} };

test("Alibaba launch dossier passes only with grounded supply and margin evidence", () => {
  const result = validateAlibabaLaunchDossier(dossier);
  assert.equal(result.passesMarginGate,true);
  assert.equal(result.contributionMarginRate,.4438);
  assert.throws(()=>validateAlibabaLaunchDossier({...dossier,supplier:{...dossier.supplier,images:[]}}),/supplier image/i);
  assert.throws(()=>validateAlibabaLaunchDossier({...dossier,economics:{...dossier.economics,sellingPrice:39}}),/margin/i);
});
