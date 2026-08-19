import test from "node:test";
import assert from "node:assert/strict";
import { buildCatalogPatch } from "../lib/catalog-policy.mjs";

const product = { id: 1, status: "draft", body_html: "<p>Truthful facts</p>", images: [{ id: 2 }], variants: [{ id: 3, price: 20 }] };

test("catalog policy permits a complete draft publication and builds all mutation fields", () => {
  const patch = buildCatalogPatch(product, { id: 1, verdict: "go_live", rationale: "Verified market evidence and truthful product facts support this decision.", title: "A Product", seo_title: "A Product | Autivara", seo_description: "A sufficiently clear and truthful product description.", image_alts: ["Product on a table"], new_price: 30 });
  assert.equal(patch.status, "active");
  assert.deepEqual(patch.variant_prices, { 3: "30.00" });
});

test("catalog policy blocks incomplete or mismatched publication", () => {
  assert.throws(() => buildCatalogPatch(product, { id: 2, verdict: "archive", rationale: "This rationale is deliberately long enough for the policy." }), /wrong product/);
  assert.throws(() => buildCatalogPatch({ ...product, images: [] }, { id: 1, verdict: "go_live", rationale: "Verified market evidence and truthful product facts support this decision.", title: "A", seo_title: "SEO", seo_description: "Description" }), /no images/);
});

test("catalog policy accepts fresh category-level market evidence", () => {
  const evidenced = { ...product, seo_evidence: { complete: true, evidenceScope: "category", expiresAt: "2026-09-01T00:00:00.000Z" } };
  const patch = buildCatalogPatch(evidenced, { id: 1, verdict: "keep_active", rationale: "Category demand, SERPs, Shopping offers, and competitors support this listing.", title: "A Product", seo_title: "A Product | Autivara", seo_description: "A sufficiently clear and truthful product description." }, { requireSeoEvidence: true, now: new Date("2026-08-18T00:00:00Z") });
  assert.equal(patch.title, "A Product");
});
