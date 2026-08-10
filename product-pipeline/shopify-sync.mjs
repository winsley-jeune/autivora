#!/usr/bin/env node
// Upserts the catalog to Shopify by HANDLE — never deletes implicitly. Matches existing
// products by handle: updates them in place (preserving product/variant/metafield IDs, so
// order line-item references, analytics joins, and indexed URLs stay intact), creates
// anything net-new, and leaves anything present in the store but absent from the catalog
// completely untouched unless you explicitly pass --delete-missing.
//
// Previous behavior (delete ALL products, then recreate) was correct for pre-launch bootstrap
// but became the single most destructive command in the repo once the store had real orders:
// delete-and-recreate breaks product IDs (orphaning order line items + analytics joins), resets
// inventory, and can 404 a URL Google has already indexed if a handle ever drifts.
//
// Requires the Admin API app (Dev Dashboard "autivara") to have read_products + write_products
// in its granted scopes — see agents/ARCHITECTURE.md for how that was set up (2026-07-26: scope
// added and merchant-approved via the store's "Update data access" consent screen).
//
// Usage:
//   node product-pipeline/shopify-sync.mjs                          # dry run: shows the diff, no writes
//   node product-pipeline/shopify-sync.mjs --confirm                # updates existing + creates net-new (never deletes)
//   node product-pipeline/shopify-sync.mjs --confirm --delete-missing   # also deletes products absent from the catalog
//   node product-pipeline/shopify-sync.mjs --catalog=catalog-novelty.json --confirm
//
// Reads credentials from .env: SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID,
// SHOPIFY_ADMIN_CLIENT_SECRET — same Dev Dashboard app + OAuth client-credentials grant the
// analytics agent already uses for orders (agents/lib/shopify.mjs). The legacy
// static "Private access token" this script used before was a Storefront API credential (from
// the store's Headless channel), not an Admin API token — it could never have written products
// regardless of any scope setting, which is why this needed fixing rather than just re-pasting a
// token.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getShopifyAdminToken } from "../agents/lib/shopify.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const API = "2024-10";
const CONFIRM = process.argv.includes("--confirm");
const DELETE_MISSING = process.argv.includes("--delete-missing");
const STATUS = process.argv.includes("--active") ? "active" : "draft"; // status for NET-NEW products only; existing products keep their current status on update
const CATALOG_FLAG = process.argv.find((a) => a.startsWith("--catalog="));
// catalog.json is the older 8-product catalog and hasn't been touched since before the
// Autivora->Autivara rename / pricing v2 — catalog-novelty.json is the actively maintained
// 19-product line. Defaulting to catalog.json only for backward compat; pass --catalog explicitly.
const CATALOG_FILE = CATALOG_FLAG ? CATALOG_FLAG.slice("--catalog=".length) : "catalog.json";

// --- env ---
function readEnv() {
  const raw = readFileSync(join(ROOT, ".env"), "utf8");
  let domain, clientId, clientSecret;
  for (const line of raw.split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "").replace(/[\r\n]/g, "");
    if (k === "SHOPIFY_STORE_DOMAIN") domain = v;
    if (k === "SHOPIFY_ADMIN_CLIENT_ID") clientId = v;
    if (k === "SHOPIFY_ADMIN_CLIENT_SECRET") clientSecret = v;
  }
  if (!domain || !clientId || !clientSecret) {
    throw new Error("Missing SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID, or SHOPIFY_ADMIN_CLIENT_SECRET in .env");
  }
  return { domain, clientId, clientSecret };
}
const { domain, clientId, clientSecret } = readEnv();
// Populated by the OAuth client-credentials exchange at the top of main() — a fresh, short-lived
// (24h) token per run, not a static key. `api()`/`listAllProducts()` close over this variable.
let token;
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
  let url = `products.json?limit=250&fields=id,title,handle,status,variants,tags`;
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

async function listMetafields(productId) {
  const json = await api("GET", `products/${productId}/metafields.json?limit=250`);
  return json.metafields || [];
}

// --- build product payloads from the catalog ---
function buildPayloads() {
  const cat = JSON.parse(readFileSync(join(__dir, CATALOG_FILE), "utf8"));
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

  // Not every catalog has a separate refill-oil line (catalog-novelty.json doesn't) — guard it.
  const oil = cat.oil_line;
  if (oil) {
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
  }
  return payloads;
}

// Attaches existing variant/metafield IDs so the PUT updates in place instead of creating
// duplicates. Warns (doesn't silently drop) about existing variants the catalog no longer
// lists — Shopify removes any variant omitted from a PUT's variants array.
async function prepareUpdate(existingProduct, payload) {
  const existingBySku = new Map((existingProduct.variants || []).map((v) => [v.sku, v]));
  const matchedSkus = new Set();
  const variants = payload.product.variants.map((v) => {
    const match = existingBySku.get(v.sku);
    if (match) { matchedSkus.add(v.sku); return { ...v, id: match.id }; }
    return v;
  });
  const droppedVariants = (existingProduct.variants || []).filter((v) => !matchedSkus.has(v.sku));
  if (droppedVariants.length) {
    console.warn(`  ⚠ ${payload.product.handle}: catalog no longer lists variant(s) ${droppedVariants.map((v) => v.sku).join(", ")} — Shopify will remove them on update`);
  }

  const existingMetafields = await listMetafields(existingProduct.id);
  const metafields = payload.product.metafields.map((m) => {
    const match = existingMetafields.find((em) => em.namespace === m.namespace && em.key === m.key);
    return match ? { ...m, id: match.id } : m;
  });

  // CRITICAL: preserve the live product's status. payload.product carries status=STATUS
  // (draft by default) intended for NET-NEW creates only — spreading it into updates demoted
  // the ENTIRE live store to draft on every sync run (discovered 2026-08-01: store had been
  // dark/unpurchasable since the 2026-07-26 sync; zero active products, all 46 draft).
  return { product: { id: existingProduct.id, ...payload.product, status: existingProduct.status, variants, metafields } };
}

// --- main ---
(async () => {
  token = await getShopifyAdminToken(domain, clientId, clientSecret);
  console.log(`Store: ${domain} | API ${API} | catalog=${CATALOG_FILE} | new products status=${STATUS}`);
  const existing = await listAllProducts();
  const existingByHandle = new Map(existing.map((p) => [p.handle, p]));
  const payloads = buildPayloads();
  const catalogHandles = new Set(payloads.map((p) => p.product.handle));

  const toUpdate = payloads.filter((p) => existingByHandle.has(p.product.handle));
  const toCreate = payloads.filter((p) => !existingByHandle.has(p.product.handle));
  const presentNotInCatalog = existing.filter((p) => !catalogHandles.has(p.handle));

  console.log(`\nWILL UPDATE ${toUpdate.length} existing product(s) (matched by handle):`);
  toUpdate.forEach((p) => console.log(`  ~ ${p.product.handle}`));
  console.log(`\nWILL CREATE ${toCreate.length} new product(s):`);
  toCreate.forEach((p) => console.log(`  + ${p.product.handle}`));
  console.log(`\nPRESENT IN STORE, ABSENT FROM CATALOG (${presentNotInCatalog.length}) — left untouched unless --delete-missing:`);
  presentNotInCatalog.forEach((p) => console.log(`  ? ${p.id} | ${p.status} | ${p.handle}`));
  if (presentNotInCatalog.length && DELETE_MISSING) {
    console.log(`  --delete-missing is set: these WILL be deleted.`);
  }

  if (!CONFIRM) {
    console.log(`\n[DRY RUN] No changes made. Re-run with --confirm to execute.`);
    return;
  }

  console.log(`\n--- UPDATING ---`);
  let updated = 0;
  for (const payload of toUpdate) {
    try {
      const existingProduct = existingByHandle.get(payload.product.handle);
      const prepared = await prepareUpdate(existingProduct, payload);
      await api("PUT", `products/${existingProduct.id}.json`, prepared);
      console.log(`  updated ${payload.product.handle}`);
      updated++;
    } catch (e) {
      console.error(`  FAILED update ${payload.product.handle}: ${e.message}`);
    }
  }

  console.log(`--- CREATING ---`);
  let created = 0;
  for (const payload of toCreate) {
    try {
      const r = await api("POST", `products.json`, payload);
      console.log(`  created ${r.product.handle} (${r.product.variants.length} variant(s))`);
      created++;
    } catch (e) {
      console.error(`  FAILED create ${payload.product.handle}: ${e.message}`);
    }
  }

  let deleted = 0;
  if (DELETE_MISSING && presentNotInCatalog.length) {
    console.log(`--- DELETING (--delete-missing) ---`);
    for (const p of presentNotInCatalog) {
      try {
        await api("DELETE", `products/${p.id}.json`);
        console.log(`  deleted ${p.handle}`);
        deleted++;
      } catch (e) {
        console.error(`  FAILED delete ${p.handle}: ${e.message}`);
      }
    }
  }

  console.log(`\nDone. Updated ${updated}/${toUpdate.length}, created ${created}/${toCreate.length}, deleted ${deleted}/${presentNotInCatalog.length}.`);
  console.log(`Net-new products are STATUS=${STATUS}. Existing products keep their current status.`);
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
