#!/usr/bin/env node
// Fast, deterministic catalog reconciliation. This runs before strategy so every agent reasons
// over Shopify's complete current state, including drafts and archived products.
import { pullCompleteShopifyCatalog, recordShopifyCatalogSnapshot } from "../lib/shopify-catalog.mjs";
import { recordEvidence } from "../lib/evidence-store.mjs";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { deriveCommercialSurfaces, recordCommercialSurfaces } from "../lib/commercial-surfaces.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const readJson = (path) => existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;

const snapshot = await pullCompleteShopifyCatalog();
recordShopifyCatalogSnapshot(snapshot);
recordEvidence({
  evidenceKey: `shopify:catalog:${snapshot.hash}`,
  source: "shopify", kind: "catalog", observedAt: snapshot.observedAt,
  dataThrough: snapshot.observedAt, maxAgeMs: 26 * 60 * 60 * 1000,
  complete: snapshot.complete, completeness: snapshot.completeness, payload: snapshot,
});
const searchConsole = readJson(join(root, "agents", "analytics", "output", "search-console-latest.json"));
const indexCoverage = readJson(join(root, "agents", "analytics", "output", "index-coverage-latest.json"));
const surfaces = recordCommercialSurfaces(deriveCommercialSurfaces(snapshot, searchConsole, indexCoverage));
console.log(`Shopify catalog synced: ${snapshot.products.length} products (${snapshot.completeness.statusCounts.active} active, ${snapshot.completeness.statusCounts.draft} draft, ${snapshot.completeness.statusCounts.archived} archived), ${snapshot.collections.length} collections.`);
console.log(`Commercial surfaces: ${surfaces.map((s) => `${s.path}=${s.productCount}/${s.indexState}`).join(", ")}`);
