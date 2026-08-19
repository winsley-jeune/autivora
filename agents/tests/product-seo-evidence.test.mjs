import test from "node:test";
import assert from "node:assert/strict";
import { canonicalKeyword, isMarketEvidenceComplete, productSeeds, productSeoCoverage, proposeProductQueryOwners, seoCategoryForProduct, seoOpportunityScore } from "../lib/product-seo-evidence.mjs";

test("product SEO seeds are grounded in live product identity", () => {
  assert.deepEqual(productSeeds({ title: "Autivara Cabin Diffuser — USB-C", product_type: "Car Diffuser", tags: ["car-diffusers"] }), ["cabin diffuser", "car diffuser", "car diffusers"]);
});

test("catalog publication waits for complete current product SEO evidence", () => {
  const snapshot = { complete: true, hash: "catalog", products: [{ id: 999001, status: "active", title: "Car Diffuser", body_html: "<p>Facts</p>", images: [{ id: 1 }], variants: [{ price: 30, inventory_management: null }] }] };
  const coverage = productSeoCoverage(snapshot, new Date("2026-08-18T00:00:00Z"));
  assert.equal(coverage.ready, false);
  assert.deepEqual(coverage.missingProductIds, [999001]);
});

test("keyword variants collapse to one commercial query cluster", () => {
  assert.equal(canonicalKeyword("Diffuser for a Car"), canonicalKeyword("car diffusers"));
  assert.equal(canonicalKeyword("diffuser car"), "car diffuser");
});

test("cold-start research groups sibling products into commercial categories", () => {
  assert.equal(seoCategoryForProduct({ title: "Cabin Diffuser", product_type: "", tags: ["car-diffusers"] }), "auto");
  assert.equal(seoCategoryForProduct({ title: "Ocean Refill", product_type: "Fragrance Oil", tags: [] }), "scents");
  assert.equal(seoCategoryForProduct({ title: "Lobby Commercial Diffuser Blend", product_type: "Diffuser Blend", tags: ["hvac"] }), "scents");
  assert.equal(seoCategoryForProduct({ title: "HVAC Scent Machine", product_type: "", tags: [] }), "industrial");
});

test("empty API responses cannot satisfy the market evidence gate", () => {
  assert.equal(isMarketEvidenceComplete({ seeds: ["car diffuser"], keywords: [], serp: {} }), false);
  assert.equal(isMarketEvidenceComplete({ seeds: ["car diffuser"], keywords: [{ keyword: "car diffuser" }], serp: { "car diffuser": [{ url: "https://example.com" }] } }), true);
});

test("product SEO opportunity favors commercial feasible demand", () => {
  const commercial = seoOpportunityScore({ volume: 500, intent: "transactional", difficulty: 20, cpc: 2 });
  const informational = seoOpportunityScore({ volume: 500, intent: "informational", difficulty: 20, cpc: 2 });
  const difficult = seoOpportunityScore({ volume: 500, intent: "transactional", difficulty: 90, cpc: 2 });
  assert.ok(commercial > informational);
  assert.ok(commercial > difficult);
});

test("broad queries belong to categories and specific mechanisms belong to products", () => {
  const proposals = proposeProductQueryOwners([{ productId: 1, handle: "cabin", keywords: [
    { keyword: "car diffuser", clusterKey: "car diffuser", opportunityScore: 10 },
    { keyword: "rechargeable car diffuser", clusterKey: "car diffuser rechargeable", opportunityScore: 8 },
    { keyword: "car diffuser essential oils", clusterKey: "car diffuser essential oil", opportunityScore: 7 },
  ] }]);
  assert.equal(proposals.find((p) => p.clusterKey === "car diffuser").ownerUrl, "/auto");
  assert.equal(proposals.find((p) => p.clusterKey.includes("rechargeable")).ownerUrl, "/product/cabin");
  assert.equal(proposals.find((p) => p.clusterKey.includes("oil")).ownerUrl, "/scents");
});
