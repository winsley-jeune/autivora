import test from "node:test";
import assert from "node:assert/strict";
import { pullCompleteShopifyCatalog } from "../lib/shopify-catalog.mjs";

test("catalog ingestion paginates every status and joins SEO and collections", async () => {
  const calls = [];
  const api = async (_method, path) => {
    calls.push(path);
    if (path.startsWith("products.json")) {
      const status = new URLSearchParams(path.split("?")[1]).get("status");
      const cursor = new URLSearchParams(path.split("?")[1]).get("page_info");
      if (status === "active" && !cursor) {
        const result = { products: [{ id: 1, status: "active", title: "A", handle: "a", variants: [{ id: 11, sku: "A", title: "Default", price: "10.00" }], images: [] }] };
        Object.defineProperty(result, "_linkNext", { value: "next" });
        return result;
      }
      if (!status && cursor === "next") return { products: [{ id: 2, status: "active", title: "B", handle: "b", variants: [], images: [] }] };
      return { products: [] };
    }
    if (path.startsWith("custom_collections")) return { custom_collections: [{ id: 9, title: "Cars", handle: "cars" }] };
    if (path.startsWith("smart_collections")) return { smart_collections: [] };
    if (path.startsWith("collects")) return { collects: [{ product_id: 1, collection_id: 9 }] };
    if (path === "products/1/metafields.json?limit=250") return { metafields: [{ namespace: "global", key: "title_tag", value: "SEO A" }] };
    if (path === "products/2/metafields.json?limit=250") return { metafields: [] };
    throw new Error(`Unexpected ${path}`);
  };
  const snapshot = await pullCompleteShopifyCatalog({ api, initialize: false, observedAt: new Date("2026-08-18T00:00:00Z") });
  assert.equal(snapshot.products.length, 2);
  assert.equal(snapshot.products[0].seo.title, "SEO A");
  assert.equal(snapshot.products[0].collections[0].handle, "cars");
  assert.equal(snapshot.completeness.statusCounts.active, 2);
  assert.ok(calls.some((p) => p.includes("page_info=next")));
});
