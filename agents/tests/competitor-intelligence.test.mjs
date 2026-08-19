import test from "node:test";
import assert from "node:assert/strict";
import { classifyCommercialPage, commercialOpportunityScore } from "../lib/espionage.mjs";

test("competitor intelligence classifies commercial winners", () => {
  assert.equal(classifyCommercialPage("https://example.com/products/car-diffuser"), "product");
  assert.equal(classifyCommercialPage("https://example.com/collections/scent-diffusers"), "category");
  assert.equal(classifyCommercialPage("https://example.com/blog/diffuser-guide"), "supporting");
});

test("commercial opportunity favors proven category demand and missing rankings", () => {
  const gap = commercialOpportunityScore({ totalKeywordVolume: 5000, keywordCount: 20, bestPosition: 3, pageType: "category", ourPosition: null });
  const covered = commercialOpportunityScore({ totalKeywordVolume: 5000, keywordCount: 20, bestPosition: 3, pageType: "category", ourPosition: 4 });
  const blog = commercialOpportunityScore({ totalKeywordVolume: 5000, keywordCount: 20, bestPosition: 3, pageType: "supporting", ourPosition: null });
  assert.ok(gap > covered);
  assert.ok(gap > blog);
});
