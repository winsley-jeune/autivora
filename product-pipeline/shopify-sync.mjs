#!/usr/bin/env node
// Deletes ALL products on the Shopify store, then creates the catalog from catalog.json.
// Requires Admin API token with read_products + write_products scope.
//
// Usage:
//   node product-pipeline/shopify-sync.mjs            # dry run: lists what WOULD be deleted/created
//   node product-pipeline/shopify-sync.mjs --confirm  # actually deletes all + creates the catalog
//
// Reads credentials from .env: "Private access token" (shpat_...) and SHOPIFY_STORE_DOMAIN.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const API = "2024-10";
const CONFIRM = process.argv.includes("--confirm");
const STATUS = process.argv.includes("--active") ? "active" : "draft"; // default draft for safety

// --- env ---
function readEnv() {
  const raw = readFileSync(join(ROOT, ".env"), "utf8");
  let domain, token;
  for (const line of raw.split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "").replace(/[\r\n]/g, "");
    if (k === "SHOPIFY_STORE_DOMAIN") domain = v;
    if (k === "Private access token") token = v;
  }
  if (!domain || !token) throw new Error("Missing SHOPIFY_STORE_DOMAIN or 'Private access token' in .env");
  return { domain, token };
}
const { domain, token } = readEnv();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, path, body) {
  const res = await fetch(`https://${domain}/admin/api/${API}/${path}`, {
    method,
    headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { _raw: text }; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  await sleep(550); // throttle: stay under 2 req/sec (Basic plan)
  return json;
}

async function listAllProducts() {
  const all = [];
  let url = `products.json?limit=250&fields=id,title,handle,status`;
  while (url) {
    const res = await fetch(`https://${domain}/admin/api/${API}/${url}`, {
      headers: { "X-Shopify-Access-Token": token },
    });
    if (!res.ok) throw new Error(`list → ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const json = await res.json();
    all.push(...(json.products || []));
    const link = res.headers.get("link") || "";
    const next = link.match(/<[^>]*[?&]page_info=([^>&]+)[^>]*>;\s*rel="next"/);
    url = next ? `products.json?limit=250&page_info=${next[1]}` : null;
    await sleep(550);
  }
  return all;
}

// --- build product payloads from catalog.json ---
function buildPayloads() {
  const cat = JSON.parse(readFileSync(join(__dir, "catalog.json"), "utf8"));
  const payloads = [];
  const seoMetafields = (title, desc) => [
    { namespace: "global", key: "title_tag", value: title, type: "single_line_text_field" },
    { namespace: "global", key: "description_tag", value: desc, type: "multi_line_text_field" },
  ];

  for (const p of cat.products) {
    payloads.push({
      product: {
        title: p.title,
        body_html: p.body_html,
        vendor: cat.brand,
        product_type: p.type,
        tags: [...(p.tags || []), p.collection].join(", "),
        handle: p.handle,
        status: STATUS,
        variants: [{
          price: p.price.toFixed(2),
          compare_at_price: p.compare_at ? p.compare_at.toFixed(2) : null,
          sku: p.sku,
          inventory_management: "shopify",
          inventory_policy: "deny",
        }],
        metafields: seoMetafields(p.seo_title, p.seo_description),
      },
    });
  }

  const oil = cat.oil_line;
  for (const s of oil.scents) {
    payloads.push({
      product: {
        title: `${s.name} — Cold-Air Fragrance Oil`,
        body_html: `<p><strong>${s.name}</strong> — ${s.notes}. ${s.seo} Water-free, engineered for Autivora cold-air diffusers.</p>`,
        vendor: cat.brand,
        product_type: oil.type,
        tags: ["fragrance-oil", "refill", oil.collection, s.family ? `scent-${s.family.toLowerCase()}` : ""].filter(Boolean).join(", "),
        handle: s.handle,
        status: STATUS,
        options: [{ name: "Size" }],
        variants: oil.sizes.map((sz) => ({
          option1: sz.name,
          price: sz.price.toFixed(2),
          sku: `AV-OIL-${s.handle.replace("oil-", "").toUpperCase()}-${sz.sku_suffix}`,
          inventory_management: "shopify",
          inventory_policy: "deny",
        })),
        metafields: seoMetafields(`${s.name} | Cold-Air Fragrance Oil for Car & Home | Autivora`, s.seo),
      },
    });
  }
  return payloads;
}

// --- main ---
(async () => {
  console.log(`Store: ${domain} | API ${API} | new products status=${STATUS}`);
  const existing = await listAllProducts();
  const payloads = buildPayloads();

  console.log(`\nWILL DELETE ${existing.length} existing product(s):`);
  existing.forEach((p) => console.log(`  - ${p.id} | ${p.status} | ${p.handle}`));
  console.log(`\nWILL CREATE ${payloads.length} new product(s) from catalog.json.`);

  if (!CONFIRM) {
    console.log(`\n[DRY RUN] No changes made. Re-run with --confirm to execute.`);
    return;
  }

  console.log(`\n--- DELETING ---`);
  for (const p of existing) {
    await api("DELETE", `products/${p.id}.json`);
    console.log(`  deleted ${p.handle}`);
  }

  console.log(`--- CREATING ---`);
  let ok = 0;
  for (const payload of payloads) {
    try {
      const r = await api("POST", `products.json`, payload);
      console.log(`  created ${r.product.handle} (${r.product.variants.length} variant(s))`);
      ok++;
    } catch (e) {
      console.error(`  FAILED ${payload.product.handle}: ${e.message}`);
    }
  }
  console.log(`\nDone. Deleted ${existing.length}, created ${ok}/${payloads.length}.`);
  console.log(`Products are STATUS=${STATUS}. Add images + set inventory, then set Active.`);
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
