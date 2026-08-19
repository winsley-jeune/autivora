#!/usr/bin/env node
// Change-driven end-to-end catalog loop. Daily synchronization is cheap; market audit and
// independent verification run only when Shopify's normalized catalog hash changes.
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { latestShopifyCatalogSnapshot } from "../lib/shopify-catalog.mjs";
import { kvGet, kvSet } from "../lib/db.mjs";
import { categorySeoCoverage } from "../lib/product-seo-evidence.mjs";
import { managedCatalogScope } from "../lib/catalog-scope.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const snapshot = latestShopifyCatalogSnapshot();
if (!snapshot?.complete) throw new Error("Catalog autonomous loop requires a complete catalog:sync snapshot");
const scope = managedCatalogScope(snapshot);
const coverage = categorySeoCoverage(snapshot);
if (!coverage.ready) {
  console.log(`Catalog autonomous: waiting for category SEO evidence (${coverage.complete}/${coverage.expected}; missing: ${coverage.missingCategories.join(", ")}); no audit or publish.`);
  process.exit(0);
}
const last = kvGet("catalog.last_audited_hash");
const decisionHash = `${scope.hash}:${coverage.hash}`;
if (last?.hash !== decisionHash) {
  console.log(`Managed catalog changed (${scope.hash.slice(0, 12)}; ${scope.managedCount} in scope, ${scope.excludedCount} excluded); generating a fresh market audit...`);
  execFileSync(process.execPath, [join(root, "agents", "dropship", "audit-catalog.mjs")], { cwd: root, stdio: "inherit" });
  const audit = JSON.parse(readFileSync(join(root, "agents", "dropship", "output", "audit-latest.json"), "utf8"));
  if (!audit.auditComplete || audit.scopeHash !== scope.hash || audit.results?.length !== scope.managedCount) {
    throw new Error("Fresh managed catalog audit is incomplete; publishing remains blocked");
  }
  kvSet("catalog.last_audited_hash", { hash: decisionHash, auditedAt: new Date().toISOString() });
}
execFileSync(process.execPath, [join(root, "agents", "scripts", "catalog-operate.mjs")], { cwd: root, stdio: "inherit" });
