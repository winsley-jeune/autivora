#!/usr/bin/env node
// One-time migration into the Scout catalog store. Sources of truth, in order of preference:
//   - Shopify itself for the 24 already-imported drafts (tag `dropship` + dropship metafields) —
//     self-healing, no dependence on scratch files
//   - the session's delivery-check scratch file (if still present) to seed the rejected/cooldown
//     list with known-stale candidates so Scout doesn't burn verification budget re-checking them
//   - the old real-account token cache (if present) moved to the canonical state path
// Run once: node agents/dropship/scripts/migrate-catalog.mjs
import { readFileSync, existsSync, copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mutateCatalog, loadCatalog } from "../lib/catalog-store.mjs";
import { initShopify, listDropshipProducts, getDropshipMetafields } from "../lib/shopify.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const today = () => new Date().toISOString().slice(0, 10);

// Keyword territory seeded from what the manual sessions PROVED yields real candidates —
// Scout expands/retires from here on its own.
const SEED_KEYWORDS = {
  "us-fast": [
    "commercial scent diffuser",
    "hotel scent machine",
    "wall plug scent diffuser",
    "essential oil diffuser smart",
    "car fragrance diffuser",
    "nebulizing diffuser",
  ],
  "value-china": [
    "mini electric humidifier diffuser",
    "USB mini humidifier aromatherapy",
    "cute mini diffuser desktop",
    "car diffuser humidifier mini",
    "kawaii air freshener diffuser",
    "night light mini diffuser humidifier",
    "car vent clip aromatherapy cartoon",
    "wood grain aroma diffuser mini",
  ],
};

const tierFromTags = (tags) => (tags.includes("china-origin") || tags.includes("value") ? "value-china" : "us-fast");
const collectionFromTags = (tags) => ["business", "home", "car"].find((c) => tags.includes(c)) ?? "home";

async function main() {
  const existing = loadCatalog();
  if (existing.products.length) {
    console.log(`Catalog already has ${existing.products.length} products — refusing to double-migrate.`);
    process.exit(1);
  }

  // token move
  const oldToken = join(ROOT, ".real-token-cache.json");
  const newToken = join(ROOT, "state", "aliexpress-token.json");
  if (existsSync(oldToken) && !existsSync(newToken)) {
    mkdirSync(join(ROOT, "state"), { recursive: true });
    copyFileSync(oldToken, newToken);
    console.log("Moved real-account token cache → state/aliexpress-token.json");
  }

  await initShopify();
  const products = await listDropshipProducts();
  console.log(`Found ${products.length} dropship-tagged products in Shopify.`);

  const records = [];
  for (const p of products) {
    const tags = p.tags.split(",").map((t) => t.trim());
    const mf = await getDropshipMetafields(p.id);
    if (!mf.aliexpress_product_id) {
      console.warn(`  skip ${p.id} "${p.title}" — no dropship metafields`);
      continue;
    }
    const variant = p.variants[0];
    records.push({
      itemId: String(mf.aliexpress_product_id),
      skuId: String(mf.aliexpress_sku_id ?? ""),
      tier: tierFromTags(tags),
      collection: collectionFromTags(tags),
      title: p.title,
      shopifyId: p.id,
      status: p.status === "active" ? "live" : "draft",
      landedCost: parseFloat(mf.landed_cost_usd ?? "0"),
      price: variant?.price,
      priceMultiple: mf.landed_cost_usd ? Math.round((parseFloat(variant?.price ?? 0) / parseFloat(mf.landed_cost_usd)) * 10) / 10 : null,
      stock: parseInt(mf.real_stock_at_import ?? "0"),
      importedOn: "2026-07-29",
      lastVerifiedOn: "2026-07-29",
      verifyHistory: [{ on: "2026-07-29", ok: true, stock: parseInt(mf.real_stock_at_import ?? "0"), note: "migrated from pre-Scout import" }],
    });
    console.log(`  ${records.at(-1).tier} / ${records.at(-1).collection}: ${p.title}`);
    await new Promise((r) => setTimeout(r, 300));
  }

  // seed rejects from the scratch delivery-check file if it survives
  const rejected = {};
  const scratch = join(ROOT, ".delivery-check-results.json");
  if (existsSync(scratch)) {
    const results = JSON.parse(readFileSync(scratch, "utf8"));
    const importedIds = new Set(records.map((r) => r.itemId));
    for (const r of results) {
      if (importedIds.has(String(r.itemId))) continue;
      if (r.skuStock === 0 || r.freightMsg === "DELIVERY_NOT_AVAILABLE_TO_YOUR_ADDRESS" || r.error) {
        rejected[String(r.itemId)] = { reason: r.error ?? r.freightMsg ?? "zero live stock at last check", on: today() };
      }
    }
    console.log(`Seeded ${Object.keys(rejected).length} known-dead candidates into the cooldown list.`);
  }

  await mutateCatalog((store) => {
    store.products = records;
    store.rejected = rejected;
    store.keywordQueue = SEED_KEYWORDS;
    store.lessons.push({
      on: today(),
      lesson:
        "Migrated 24 pre-Scout imports. Established truths: (1) freight.query is the only stock/delivery truth — listings lie; (2) ship_from=US pool is tiny and skews expensive B2B equipment (NAMSTE), thin per-SKU stock; (3) the real impulse-buy pool is China-origin 7-14d, $1-10 landed, with deep social proof (3k-17k reviews); (4) cheap items are almost never genuinely US-warehoused; (5) 'diffuser' collides with auto body-kits and raw oil bottles — filter by title.",
    });
  });
  console.log(`\nMigrated ${records.length} products into agents/dropship/state/catalog.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
