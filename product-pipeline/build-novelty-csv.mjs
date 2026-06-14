#!/usr/bin/env node
// Reads catalog-novelty.json and emits a Shopify-import CSV (official 57-column
// product_template format) for the 19 sourced products, WITH multiple images per
// product. Products with <4 staged images import as Draft; >=4 as Active.
// Re-run after editing catalog-novelty.json:  node product-pipeline/build-novelty-csv.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const cat = JSON.parse(readFileSync(join(__dir, "catalog-novelty.json"), "utf8"));

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

const QTY = (process.argv.find((a) => a.startsWith("--qty="))?.split("=")[1]) ?? "100";

const variantDefaults = {
  "Inventory tracker": "shopify",
  "Inventory quantity": QTY,
  "Continue selling when out of stock": "DENY",
  "Weight unit for display": "g",
  "Requires shipping": "TRUE",
  "Fulfillment service": "manual",
};

const rows = [];
let active = 0;
for (const p of cat.products) {
  const isReady = (p.images?.length ?? 0) >= 4; // only fully-imaged products go live
  if (isReady) active++;
  const firstImg = p.images?.[0] ?? "";
  rows.push({
    ...variantDefaults,
    "Title": p.title,
    "URL handle": p.handle,
    "Description": p.body_html,
    "Vendor": cat.brand,
    "Type": p.type,
    "Tags": [...(p.tags || []), p.collection].join(", "),
    "Published on online store": isReady ? "TRUE" : "FALSE",
    "Status": isReady ? "Active" : "Draft",
    "SKU": p.sku,
    "Option1 name": "Title",
    "Option1 value": "Default Title",
    "Price": p.price.toFixed(2),
    "Compare-at price": p.compare_at ? p.compare_at.toFixed(2) : "",
    "Charge tax": "TRUE",
    "Gift card": "FALSE",
    "Product image URL": firstImg,
    "Image position": firstImg ? "1" : "",
    "Image alt text": firstImg ? p.title : "",
    "SEO title": p.seo_title,
    "SEO description": p.seo_description,
  });
  // additional images: one image-only row each (handle + image fields)
  (p.images || []).slice(1).forEach((url, i) => {
    rows.push({
      "URL handle": p.handle,
      "Product image URL": url,
      "Image position": String(i + 2),
      "Image alt text": `${p.title} — view ${i + 2}`,
    });
  });
}

const csv = [COLS.join(","), ...rows.map(rowToLine)].join("\n") + "\n";
const out = join(__dir, "output", "products-novelty-shopify.csv");
writeFileSync(out, csv);

console.log(`✓ Wrote ${out}  (Shopify 57-column template, multi-image)`);
console.log(`  Products: ${cat.products.length}  |  Active(>=4 img): ${active}  |  Draft: ${cat.products.length - active}`);
console.log(`  Collections (create as smart collections by tag): ${cat.collections.map((c) => c.handle).join(", ")}`);
console.log(`  Total rows (products + extra images): ${rows.length}`);
console.log(`  Inventory=${QTY}. Image URLs resolve once /public/products is committed + deployed to autivara.com.`);
