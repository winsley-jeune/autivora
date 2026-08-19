#!/usr/bin/env node
// Full-catalog fresh-eyes audit (operator-invoked, reusable — not part of the daily loop).
//
// Pulls EVERY product regardless of status, batches them by rough category, and runs each
// batch through a web-search-enabled auditor pass (prompt-audit.md) that judges from live
// market evidence only — deliberately given no internal labels, prior verdicts, or lessons,
// so past decisions can't launder themselves into new ones. Output: per-product verdict
// (keep_active / reprice / go_live / archive) plus fully rebuilt listing assets (title, SEO
// title/description, per-image alt text).
//
// WRITES NOTHING to Shopify. Results land in output/audit-latest.json for operator review;
// applying them is a separate, explicitly-approved step.
//
// Usage: node agents/dropship/audit-catalog.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readEnv } from "../lib/env.mjs";
import { pullCompleteShopifyCatalog, recordShopifyCatalogSnapshot } from "../lib/shopify-catalog.mjs";
import { loadCatalog } from "./lib/catalog-store.mjs";
import { callCatalogAudit } from "./lib/anthropic.mjs";
import { compactSeoEvidence, seoCategoryForProduct, seoEvidenceForProduct } from "../lib/product-seo-evidence.mjs";
import { managedCatalogScope } from "../lib/catalog-scope.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const today = () => new Date().toISOString().slice(0, 10);

// Rough category split keeps each audit call's search space coherent (one call researching
// "humidors" does better work than one juggling humidors + car clips + HVAC).
const CATEGORY_RULES = [
  { key: "commercial", re: /hvac|commercial|hotel|mall|office|business|atmos/i },
  { key: "cedar-gift", re: /humidor|cigar|cedar|hygrometer/i },
  { key: "car", re: /car|vent|vehicle|auto(?!matic)/i },
  { key: "home", re: /./ }, // fallback
];
const categorize = (title) => CATEGORY_RULES.find((r) => r.re.test(title)).key;

async function main() {
  const { ANTHROPIC_API_KEY } = readEnv(["ANTHROPIC_API_KEY"]);

  // Landed costs are facts (freight-verified), not opinions — the auditor needs them for the
  // 3x floor. Everything else from internal state (flags, lessons, verdicts) stays out.
  let landedByAe = new Map();
  try {
    landedByAe = new Map(loadCatalog().products.map((p) => [p.itemId, p.landedCost]));
  } catch {}

  const snapshot = await pullCompleteShopifyCatalog();
  recordShopifyCatalogSnapshot(snapshot);
  const scope = managedCatalogScope(snapshot);
  const products = scope.products;
  console.log(`Audit: ${products.length} managed product(s); ${scope.excludedCount} incomplete/archived product(s) excluded.`);

  const batches = {};
  for (const p of products) {
    const aeId = (p.variants?.[0]?.sku ?? "").match(/^AE-(\d+)/)?.[1] ?? null;
    (batches[categorize(p.title)] ??= []).push({
      id: p.id,
      status: p.status,
      title: p.title,
      sku: p.variants?.[0]?.sku ?? null,
      price: Number(p.variants?.[0]?.price),
      landed_cost: aeId ? (landedByAe.get(aeId) ?? null) : null, // null for owned AV- SKUs
      product_type: p.product_type,
      body_html: p.body_html,
      current_seo_title: p.seo.title,
      current_seo_description: p.seo.description,
      collections: p.collections,
      variants: p.variants,
      images: p.images.map((i) => ({ id: i.id, position: i.position, src: i.src, current_alt: i.alt })),
      seo_evidence_ref: seoCategoryForProduct(p),
    });
  }

  const systemPrompt = readFileSync(join(__dir, "prompt-audit.md"), "utf8");
  const results = [];
  for (const [category, batch] of Object.entries(batches)) {
    console.log(`Audit: [${category}] auditing ${batch.length} product(s) with live search...`);
    try {
      const { output } = await callCatalogAudit({
        apiKey: ANTHROPIC_API_KEY,
        systemPrompt,
        userInput: { date: today(), category,
          market_evidence: [...new Map(batch.map((product) => {
            const live = products.find((p) => String(p.id) === String(product.id));
            const evidence = compactSeoEvidence(seoEvidenceForProduct(live, snapshot));
            return [product.seo_evidence_ref, evidence];
          })).values()].filter(Boolean),
          products: batch },
      });
      for (const v of output.verdicts ?? []) results.push({ category, ...v });
      console.log(`Audit: [${category}] ${output.verdicts?.length ?? 0} verdict(s). ${output.batch_note ?? ""}`);
    } catch (e) {
      console.error(`Audit: [${category}] FAILED: ${e.message.slice(0, 160)} — other batches continue.`);
    }
  }

  const byVerdict = {};
  for (const r of results) (byVerdict[r.verdict] ??= []).push(r);
  const expectedIds = new Set(products.map((product) => String(product.id)));
  const judgedIds = new Set(results.map((result) => String(result.id)).filter((id) => expectedIds.has(id)));
  const auditComplete = judgedIds.size === expectedIds.size && results.length === expectedIds.size;

  mkdirSync(join(__dir, "output"), { recursive: true });
  const outPath = join(__dir, "output", "audit-latest.json");
  writeFileSync(outPath, JSON.stringify({ date: today(), catalogHash: snapshot.hash, scopeHash: scope.hash,
    productCount: products.length, excludedCount: scope.excludedCount, auditComplete,
    completeness: snapshot.completeness, results }, null, 2));

  console.log(`\n=== AUDIT SUMMARY (${results.length}/${products.length} judged) ===`);
  for (const [verdict, list] of Object.entries(byVerdict)) {
    console.log(`\n--- ${verdict.toUpperCase()} (${list.length}) ---`);
    for (const r of list) {
      const priceNote = r.verdict === "reprice" ? ` -> $${r.new_price}` : "";
      console.log(`  [${r.id}] $${r.current_price}${priceNote} | ${r.title ?? r.current_title}`);
      console.log(`      ${r.rationale.slice(0, 160)}`);
    }
  }
  console.log(`\nSaved → ${outPath} (no Shopify writes — apply is a separate approved step)`);
  if (!auditComplete) throw new Error(`Catalog audit incomplete: ${judgedIds.size}/${expectedIds.size} managed products judged; publishing remains blocked`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
