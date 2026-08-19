// Shopify executor for Scout — the only module that writes to the store. Products always land
// as DRAFTS: publishing (and anything touching a live product) stays a human decision, matching
// the growth-loop principle of human approval on customer-facing/spend actions.
// Client/auth lives in agents/lib/shopify.mjs; this module owns only Scout's write payloads.
import { initShopify, shopifyApi } from "../../lib/shopify.mjs";
import { reserveOperation, completeOperation, failOperation } from "../../lib/control-plane.mjs";

export { initShopify, shopifyApi };

async function findProductBySku(sku) {
  const query = `query ProductBySku($query: String!) {
    productVariants(first: 2, query: $query) {
      nodes { id sku product { id legacyResourceId title status handle } }
    }
  }`;
  const res = await shopifyApi("POST", "graphql.json", { query, variables: { query: `sku:${JSON.stringify(sku)}` } });
  if (res.errors?.length) throw new Error(`Shopify product lookup failed: ${JSON.stringify(res.errors).slice(0, 500)}`);
  const matches = res.data?.productVariants?.nodes ?? [];
  const exact = matches.find((v) => v.sku === sku);
  if (!exact) return null;
  return { ...exact.product, id: Number(exact.product.legacyResourceId) };
}

async function createProductIdempotently({ operationKey, sku, payload }) {
  const reservation = reserveOperation({ operationKey, kind: "shopify.product.create", request: { sku } });
  if (!reservation.reserved) {
    if (reservation.reason === "complete") return reservation.result;
    throw new Error(`Shopify creation already in progress for ${sku}`);
  }

  const operationId = reservation.operation.id;
  try {
    // Reconcile before POST. This closes the lost-response/crash window: if Shopify accepted a
    // prior request but the local completion write never happened, retry finds the exact SKU.
    const existing = await findProductBySku(sku);
    if (existing) {
      completeOperation(operationId, existing);
      return existing;
    }
    const res = await shopifyApi("POST", "products.json", payload);
    completeOperation(operationId, res.product);
    return res.product;
  } catch (error) {
    try { failOperation(operationId, error.message); } catch {}
    throw error;
  }
}

// Idempotency comes from the catalog store (itemId -> shopifyId), not from searching Shopify:
// callers must not invoke this for items that already carry a shopifyId.
export async function createDraftProduct({ v, copy, price, priceMultiple, tier, collection }) {
  const sku = `AE-${v.itemId}-${v.skuId}`;
  const payload = {
    product: {
      title: copy.title,
      // Customer-facing HTML must contain customer-facing copy only. Internal supplier IDs,
      // costs, margin, stock evidence, and review notes belong in the control-plane database or
      // private metafields; HTML comments are still delivered publicly in page source.
      body_html: copy.body_html,
      vendor: "Autivara Dropship",
      product_type: copy.product_type,
      tags: `dropship,${tier},${collection},scout`,
      status: "draft",
      images: v.images.map((src) => ({ src })),
      variants: [{ price, sku, inventory_management: null }],
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
  return createProductIdempotently({ operationKey: `shopify:create:dropship:${v.itemId}:${v.skuId}`, sku, payload });
}

// Bundle drafts: an anchor-free composite SKU manufactured from verified components. The
// dropship.bundle_components metafield carries the machine-readable component list so the
// future order-relay can place one AliExpress order per component.
export async function createBundleDraft({ components, copy, price, priceMultiple, landedCost, tier, collection }) {
  const images = components.flatMap((c) => (c.images ?? []).slice(0, 2)).slice(0, 6).map((src) => ({ src }));
  const skuTail = components.map((c) => String(c.itemId).slice(-5)).join("-");
  const sku = `BND-${skuTail}`;
  const payload = {
    product: {
      title: copy.title,
      body_html: copy.body_html,
      vendor: "Autivara Dropship",
      product_type: copy.product_type,
      tags: `dropship,bundle,${tier},${collection},scout`,
      status: "draft",
      images,
      variants: [{ price, sku, inventory_management: null }],
      metafields: [
        { namespace: "global", key: "title_tag", value: copy.seo_title, type: "single_line_text_field" },
        { namespace: "global", key: "description_tag", value: copy.seo_description, type: "multi_line_text_field" },
        { namespace: "dropship", key: "bundle_components", value: JSON.stringify(components.map((c) => ({ itemId: c.itemId, skuId: c.skuId, qty: 1 }))), type: "single_line_text_field" },
        { namespace: "dropship", key: "landed_cost_usd", value: landedCost.toFixed(2), type: "single_line_text_field" },
      ],
    },
  };
  const componentKey = components.map((c) => `${c.itemId}:${c.skuId}`).sort().join("+");
  return createProductIdempotently({ operationKey: `shopify:create:bundle:${componentKey}`, sku, payload });
}

export async function listDropshipProducts() {
  const out = [];
  for (const status of ["draft", "active"]) {
    let path = `products.json?limit=250&status=${status}&fields=id,title,tags,status,variants`;
    while (path) {
      const res = await shopifyApi("GET", path);
      out.push(...res.products.filter((p) => p.tags.split(",").map((t) => t.trim()).includes("dropship")));
      path = res._linkNext ? `products.json?limit=250&page_info=${res._linkNext}&fields=id,title,tags,status,variants` : null;
    }
  }
  return out;
}

export async function getDropshipMetafields(productId) {
  const res = await shopifyApi("GET", `products/${productId}/metafields.json?namespace=dropship`);
  return Object.fromEntries(res.metafields.map((m) => [m.key, m.value]));
}
