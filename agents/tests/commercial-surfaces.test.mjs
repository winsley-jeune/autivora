import test from "node:test";
import assert from "node:assert/strict";
import { deriveCommercialSurfaces } from "../lib/commercial-surfaces.mjs";

test("commercial surfaces reflect active Shopify tag inventory and search/index evidence", () => {
  const snapshot = { complete: true, observedAt: "2026-08-18T00:00:00Z", products: [
    { id: 1, status: "active", tags: ["car-diffusers"] },
    { id: 2, status: "draft", tags: ["car-diffusers"] },
    { id: 3, status: "active", tags: ["fragrance-oil"] },
  ] };
  const search = { pages: [{ keys: ["https://autivara.com/auto"], impressions: 10, clicks: 2, position: 5 }] };
  const coverage = { results: [{ url: "https://autivara.com/auto", coverageState: "Submitted and indexed" }] };
  const surfaces = deriveCommercialSurfaces(snapshot, search, coverage);
  assert.equal(surfaces.find((s) => s.key === "auto").productCount, 1);
  assert.equal(surfaces.find((s) => s.key === "auto").impressions, 10);
  assert.equal(surfaces.find((s) => s.key === "scents").productCount, 1);
  assert.equal(surfaces.find((s) => s.key === "home").empty, true);
});
