// Shopify executor for Scout — the only module that writes to the store. Products always land
// as DRAFTS: publishing (and anything touching a live product) stays a human decision, matching
// the growth-loop principle of human approval on customer-facing/spend actions.
import { readEnv } from "../../analytics/lib/env.mjs";
import { getShopifyAdminToken } from "../../analytics/lib/shopify-auth.mjs";

const API = "2024-10";
let token = null;
let domain = null;

export async function initShopify() {
  const env = readEnv(["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_CLIENT_ID", "SHOPIFY_ADMIN_CLIENT_SECRET"]);
  domain = env.SHOPIFY_STORE_DOMAIN;
  token = await getShopifyAdminToken(domain, env.SHOPIFY_ADMIN_CLIENT_ID, env.SHOPIFY_ADMIN_CLIENT_SECRET);
}

export async function shopifyApi(method, path, body) {
  const res = await fetch(`https://${domain}/admin/api/${API}/${path}`, {
    method,
    headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { _raw: text }; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return json;
}

// Idempotency comes from the catalog store (itemId -> shopifyId), not from searching Shopify:
// callers must not invoke this for items that already carry a shopifyId.
export async function createDraftProduct({ v, copy, price, priceMultiple, tier, collection }) {
  const payload = {
    product: {
      title: copy.title,
      body_html:
        copy.body_html +
        `<!-- internal review notes: landed $${v.landedCost.toFixed(2)} (product $${v.productCost.toFixed(2)} + ship $${v.shippingFee.toFixed(2)}), multiple ${priceMultiple}x, stock ${v.stock}, ${v.rating}★/${v.reviews} reviews/${v.sales} sales, delivery ${v.deliveryMin}-${v.deliveryMax}d from ${v.shipFrom}, store ${v.storeName ?? "?"} (${v.storeCountry ?? "?"}) -->`,
      vendor: "Autivara Dropship",
      product_type: copy.product_type,
      tags: `dropship,${tier},${collection},scout`,
      status: "draft",
      images: v.images.map((src) => ({ src })),
      variants: [{ price, sku: `AE-${v.itemId}-${v.skuId}`, inventory_management: null }],
      metafields: [
        { namespace: "global", key: "title_tag", value: copy.seo_title, type: "single_line_text_field" },
        { namespace: "global", key: "description_tag", value: copy.seo_description, type: "multi_line_text_field" },
        { namespace: "dropship", key: "aliexpress_product_id", value: String(v.itemId), type: "single_line_text_field" },
        { namespace: "dropship", key: "aliexpress_sku_id", value: String(v.skuId), type: "single_line_text_field" },
        { namespace: "dropship", key: "landed_cost_usd", value: v.landedCost.toFixed(2), type: "single_line_text_field" },
        { namespace: "dropship", key: "real_stock_at_import", value: String(v.stock), type: "single_line_text_field" },
      ],
    },
  };
  const res = await shopifyApi("POST", "products.json", payload);
  return res.product;
}

export async function listDropshipProducts() {
  const out = [];
  for (const status of ["draft", "active"]) {
    let path = `products.json?limit=250&status=${status}&fields=id,title,tags,status,variants`;
    const res = await shopifyApi("GET", path);
    out.push(...res.products.filter((p) => p.tags.split(",").map((t) => t.trim()).includes("dropship")));
  }
  return out;
}

export async function getDropshipMetafields(productId) {
  const res = await shopifyApi("GET", `products/${productId}/metafields.json?namespace=dropship`);
  return Object.fromEntries(res.metafields.map((m) => [m.key, m.value]));
}
