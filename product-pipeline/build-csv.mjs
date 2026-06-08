#!/usr/bin/env node
// Reads catalog.json and emits a Shopify-import CSV matching Shopify's official
// product_template.csv (new 57-column format). Output: output/products-shopify.csv
// Re-run after editing catalog.json:  node product-pipeline/build-csv.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const cat = JSON.parse(readFileSync(join(__dir, "catalog.json"), "utf8"));

// Exact column order from Shopify's product_template.csv
const COLS = [
  "Title", "URL handle", "Description", "Vendor", "Product category", "Type", "Tags",
  "Published on online store", "Status", "SKU", "Barcode",
  "Option1 name", "Option1 value", "Option1 Linked To",
  "Option2 name", "Option2 value", "Option2 Linked To",
  "Option3 name", "Option3 value", "Option3 Linked To",
  "Price", "Compare-at price", "Cost per item", "Charge tax", "Tax code",
  "Unit price total measure", "Unit price total measure unit",
  "Unit price base measure", "Unit price base measure unit",
  "Inventory tracker", "Inventory quantity", "Continue selling when out of stock",
  "Weight value (grams)", "Weight unit for display", "Requires shipping", "Fulfillment service",
  "Product image URL", "Image position", "Image alt text", "Variant image URL", "Gift card",
  "SEO title", "SEO description",
  "Color (product.metafields.shopify.color-pattern)",
  "Google Shopping / Google product category", "Google Shopping / Gender",
  "Google Shopping / Age group", "Google Shopping / Manufacturer part number (MPN)",
  "Google Shopping / Ad group name", "Google Shopping / Ads labels",
  "Google Shopping / Condition", "Google Shopping / Custom product",
  "Google Shopping / Custom label 0", "Google Shopping / Custom label 1",
  "Google Shopping / Custom label 2", "Google Shopping / Custom label 3",
  "Google Shopping / Custom label 4",
];

const esc = (v) => {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const rowToLine = (o) => COLS.map((c) => esc(o[c] ?? "")).join(",");

// Flags: default to LIVE + in-stock. Override with --draft for a safe preview import.
const LIVE = !process.argv.includes("--draft");
const QTY = (process.argv.find((a) => a.startsWith("--qty="))?.split("=")[1]) ?? "100";

// Defaults shared by every "first row" of a product
const productDefaults = {
  "Published on online store": LIVE ? "TRUE" : "FALSE",
  "Status": LIVE ? "Active" : "Draft",
  "Charge tax": "TRUE",
  "Gift card": "FALSE",
};
// Defaults shared by every variant row (first + subsequent)
const variantDefaults = {
  "Inventory tracker": "shopify",
  "Inventory quantity": QTY,
  "Continue selling when out of stock": "DENY",
  "Weight unit for display": "g",
  "Requires shipping": "TRUE",
  "Fulfillment service": "manual",
};

const rows = [];

// --- Devices / single-variant products ---
for (const p of cat.products) {
  rows.push({
    ...productDefaults,
    ...variantDefaults,
    "Title": p.title,
    "URL handle": p.handle,
    "Description": p.body_html,
    "Vendor": cat.brand,
    "Type": p.type,
    "Tags": [...(p.tags || []), p.collection].join(", "),
    "SKU": p.sku,
    "Option1 name": "Title",
    "Option1 value": "Default Title",
    "Price": p.price.toFixed(2),
    "Compare-at price": p.compare_at ? p.compare_at.toFixed(2) : "",
    "Product image URL": p.image && !String(p.image).startsWith("TODO") ? p.image : "",
    "Image position": p.image && !String(p.image).startsWith("TODO") ? "1" : "",
    "SEO title": p.seo_title,
    "SEO description": p.seo_description,
  });
}

// --- Oils: one product per scent, 2 size variants ---
const oil = cat.oil_line;
for (const s of oil.scents) {
  oil.sizes.forEach((sz, i) => {
    const sku = `AV-OIL-${s.handle.replace("oil-", "").toUpperCase()}-${sz.sku_suffix}`;
    if (i === 0) {
      rows.push({
        ...productDefaults,
        ...variantDefaults,
        "Title": `${s.name} — Cold-Air Fragrance Oil`,
        "URL handle": s.handle,
        "Description": `<p><strong>${s.name}</strong> — ${s.notes}. ${s.seo} Water-free, engineered for Autivora cold-air diffusers.</p>`,
        "Vendor": cat.brand,
        "Type": oil.type,
        "Tags": ["fragrance-oil", "refill", oil.collection, s.family ? `scent-${s.family.toLowerCase()}` : ""].filter(Boolean).join(", "),
        "SKU": sku,
        "Option1 name": "Size",
        "Option1 value": sz.name,
        "Price": sz.price.toFixed(2),
        "SEO title": `${s.name} | Cold-Air Fragrance Oil for Car & Home | Autivora`,
        "SEO description": s.seo,
      });
    } else {
      // subsequent variant row: handle + variant fields only
      rows.push({
        ...variantDefaults,
        "URL handle": s.handle,
        "SKU": sku,
        "Option1 value": sz.name,
        "Price": sz.price.toFixed(2),
        "Charge tax": "TRUE",
      });
    }
  });
}

const csv = [COLS.join(","), ...rows.map(rowToLine)].join("\n") + "\n";
const out = join(__dir, "output", "products-shopify.csv");
writeFileSync(out, csv);

const oilVariants = oil.scents.length * oil.sizes.length;
console.log(`✓ Wrote ${out}  (Shopify 57-column template format)`);
console.log(`  Collections: ${cat.collections.length}`);
console.log(`  Devices: ${cat.products.length}  |  Oils: ${oil.scents.length} products / ${oilVariants} variants`);
console.log(`  Total data rows: ${rows.length}  |  Columns: ${COLS.length}`);
console.log(`  Status=${LIVE ? "Active" : "Draft"}, Published=${LIVE ? "TRUE" : "FALSE"}, Inventory=${QTY}, images blank.`);
if (LIVE) console.log(`  ⚠️  LIVE + in-stock: only keep products Active that you can actually ship (overselling = chargebacks/processor freeze).`);
