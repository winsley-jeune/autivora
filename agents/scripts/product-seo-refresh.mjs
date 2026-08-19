#!/usr/bin/env node
import { latestShopifyCatalogSnapshot } from "../lib/shopify-catalog.mjs";
import { categorySeoCoverage, getProductSeoEvidence, isMarketEvidenceComplete, productFingerprint, reconcileProductQueryOwners, refreshProductSeoEvidence, seoCategoryForProduct } from "../lib/product-seo-evidence.mjs";
import { managedCatalogScope } from "../lib/catalog-scope.mjs";

const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = Math.max(1, Math.min(20, Number(limitArg?.split("=")[1] ?? 5)));
const handleArg = process.argv.find((arg) => arg.startsWith("--handle="))?.split("=")[1];
const force = process.argv.includes("--force");
const snapshot = latestShopifyCatalogSnapshot();
if (!snapshot?.complete) throw new Error("Run catalog:sync before product SEO refresh");
const now = Date.now();
const scope = managedCatalogScope(snapshot);
const eligible = scope.products
  .filter((product) => !handleArg || product.handle === handleArg)
  .filter((product) => { const old = getProductSeoEvidence(product.id); return force || !old || !old.complete || !isMarketEvidenceComplete(old) || old.productFingerprint !== productFingerprint(product) || Date.parse(old.expiresAt) <= now; });
const missing = new Set(categorySeoCoverage(snapshot).missingCategories);
const categoryFirst = eligible.filter((product) => missing.has(seoCategoryForProduct(product)));
const representatives = [...new Map(categoryFirst.map((product) => [seoCategoryForProduct(product), product])).values()];
const chosen = new Set(representatives.map((product) => String(product.id)));
const products = [...representatives, ...eligible.filter((product) => !chosen.has(String(product.id)))].slice(0, limit);
for (const product of products) {
  console.log(`Product SEO: researching ${product.handle}...`);
  const evidence = await refreshProductSeoEvidence(product, { catalogHash: snapshot.hash });
  console.log(`  ${evidence.keywords.length} commercial keywords; shopping=${evidence.shopping.length}; top=${evidence.keywords[0]?.keyword ?? "none"}`);
}
const owners = reconcileProductQueryOwners();
console.log(`Product SEO refresh complete: ${products.length} product(s).`);
console.log(`Managed catalog scope: ${scope.managedCount}; incomplete/out-of-scope: ${scope.excludedCount}.`);
console.log(`Commercial query ownership reconciled: ${owners.length} cluster(s).`);
