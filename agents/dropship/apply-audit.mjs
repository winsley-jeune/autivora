#!/usr/bin/env node
// Applies an operator-APPROVED catalog audit (output/audit-latest.json) to Shopify.
// Counterpart to audit-catalog.mjs, which never writes. Run only after explicit approval.
//
// Per verdict:
//   archive               -> product status=archived
//   go_live               -> status=active, plus rebuilt copy/price like keep_active
//   keep_active / reprice -> rebuilt title, SEO metafields, per-image alt text; variant
//                            price update when new_price is present
//
// Consistency side-effects (so later automation can't silently undo this):
//   - product-pipeline/catalog-novelty.json: owned (AV-) SKUs get the rebuilt title/SEO/price
//     written back — shopify-sync pushes those fields on every run and would revert
//     Shopify-only edits.
//   - state/catalog.json: archived dropship items get status "retired" so Scout stops
//     re-verifying them daily.
//
// Usage: node agents/dropship/apply-audit.mjs [--dry]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { initShopify, shopifyApi } from "./lib/shopify.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes("--dry");
const today = () => new Date().toISOString().slice(0, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const audit = JSON.parse(readFileSync(join(__dir, "output", "audit-latest.json"), "utf8"));
  await initShopify();

  const counts = { archived: 0, published: 0, repriced: 0, copyUpdated: 0, failed: 0 };
  const ownedPatches = []; // fold back into catalog-novelty.json after the Shopify pass
  const archivedIds = new Set();

  for (const v of audit.results) {
    try {
      const { product: live } = await shopifyApi("GET", `products/${v.id}.json`);
      const sku = live.variants?.[0]?.sku ?? "";

      if (v.verdict === "archive") {
        if (!DRY) await shopifyApi("PUT", `products/${v.id}.json`, { product: { id: v.id, status: "archived" } });
        archivedIds.add(String(v.id));
        counts.archived++;
        console.log(`archived   [${v.id}] ${live.title}`);
        await sleep(400);
        continue;
      }

      const product = { id: v.id };
      if (v.title) product.title = v.title;
      if (v.seo_title) product.metafields_global_title_tag = v.seo_title;
      if (v.seo_description) product.metafields_global_description_tag = v.seo_description;
      if (v.verdict === "go_live") product.status = "active";
      if (Array.isArray(v.image_alts) && v.image_alts.length && live.images?.length) {
        product.images = live.images.map((img, i) => ({ id: img.id, alt: v.image_alts[i] ?? v.image_alts[v.image_alts.length - 1] }));
      }
      if (!DRY) await shopifyApi("PUT", `products/${v.id}.json`, { product });
      counts.copyUpdated++;
      if (v.verdict === "go_live") counts.published++;

      if (v.new_price != null && live.variants?.[0]) {
        if (!DRY) await shopifyApi("PUT", `variants/${live.variants[0].id}.json`, { variant: { id: live.variants[0].id, price: Number(v.new_price).toFixed(2) } });
        counts.repriced++;
      }
      console.log(`${(v.verdict === "go_live" ? "published " : "updated   ")} [${v.id}] ${v.title ?? live.title}${v.new_price != null ? ` @ $${v.new_price}` : ""}`);

      if (sku.startsWith("AV-")) {
        ownedPatches.push({ sku, title: v.title, seo_title: v.seo_title, seo_description: v.seo_description, price: v.new_price ?? null });
      }
      await sleep(400);
    } catch (e) {
      counts.failed++;
      console.error(`FAILED     [${v.id}] ${v.current_title}: ${e.message.slice(0, 140)}`);
    }
  }

  // Owned-catalog write-back (sync source of truth).
  const novPath = join(__dir, "..", "..", "product-pipeline", "catalog-novelty.json");
  const nov = JSON.parse(readFileSync(novPath, "utf8"));
  const items = Array.isArray(nov) ? nov : (nov.products ?? nov.items);
  let patched = 0;
  for (const patch of ownedPatches) {
    const item = items.find((p) => p.sku === patch.sku);
    if (!item) continue;
    if (patch.title) item.title = patch.title;
    if (patch.seo_title) item.seo_title = patch.seo_title;
    if (patch.seo_description) item.seo_description = patch.seo_description;
    if (patch.price != null) item.price = Number(patch.price);
    patched++;
  }
  if (!DRY && patched) writeFileSync(novPath, JSON.stringify(nov, null, 2));
  console.log(`\ncatalog-novelty.json: ${patched} owned SKU(s) written back (sync source of truth).`);

  // Scout state write-back: stop re-verifying archived dropship items.
  const statePath = join(__dir, "state", "catalog.json");
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  let retired = 0;
  for (const p of state.products) {
    if (archivedIds.has(String(p.shopifyId)) && p.status !== "retired") {
      p.status = "retired";
      p.retiredOn = today();
      p.retiredReason = "fresh-eyes audit: fails anchor test / 3x floor vs live US market";
      retired++;
    }
  }
  if (!DRY && retired) writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log(`state/catalog.json: ${retired} dropship item(s) marked retired.`);

  console.log(`\n${DRY ? "[DRY RUN] " : ""}Done: ${counts.archived} archived, ${counts.published} published, ${counts.repriced} repriced, ${counts.copyUpdated} listings rebuilt, ${counts.failed} failed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
