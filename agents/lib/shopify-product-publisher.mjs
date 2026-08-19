// Autonomous, verified, rollback-capable Shopify product publishing. Callers must first record an
// independent passing verification for the exact artifact hash. Every publish is idempotent and
// retains the before state for audit/recovery.
import { randomUUID } from "node:crypto";
import { initShopify, shopifyApi } from "./shopify.mjs";
import { openDb } from "./db.mjs";
import { reserveOperation, completeOperation, failOperation } from "./control-plane.mjs";
import { requirePassingVerification } from "./verification-store.mjs";

const ALLOWED_FIELDS = new Set(["title", "body_html", "vendor", "product_type", "tags", "status", "seo_title", "seo_description", "variant_prices", "image_alts"]);
let ready = false;
function ensure() {
  const d = openDb();
  if (ready) return d;
  d.exec(`CREATE TABLE IF NOT EXISTS shopify_publish_versions (
    id TEXT PRIMARY KEY,
    operation_key TEXT NOT NULL UNIQUE,
    product_id TEXT NOT NULL,
    artifact_key TEXT NOT NULL,
    artifact_hash TEXT NOT NULL,
    before_doc TEXT NOT NULL,
    intended_doc TEXT NOT NULL,
    live_doc TEXT,
    status TEXT NOT NULL CHECK(status IN ('publishing','verified','rolled_back','rollback_failed')),
    created_at TEXT NOT NULL,
    completed_at TEXT,
    error TEXT
  );`);
  ready = true;
  return d;
}

function validatePatch(patch) {
  const fields = Object.keys(patch);
  if (!fields.length) throw new Error("Product publish patch is empty");
  const forbidden = fields.filter((field) => !ALLOWED_FIELDS.has(field));
  if (forbidden.length) throw new Error(`Product publisher cannot change: ${forbidden.join(", ")}`);
}

function fieldMatches(product, field, expected) {
    if (field === "seo_title") return String(product.seo_title ?? "") === String(expected ?? "");
    if (field === "seo_description") return String(product.seo_description ?? "") === String(expected ?? "");
    if (field === "variant_prices") return Object.entries(expected).every(([id, price]) => String(product.variants?.find((v) => String(v.id) === String(id))?.price ?? "") === String(price));
    if (field === "image_alts") return expected.every((alt, index) => String(product.images?.[index]?.alt ?? "") === String(alt ?? ""));
    if (field === "body_html") {
      const normalizeHtml = (value) => String(value ?? "").replace(/\r?\n/g, "").replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
      return normalizeHtml(product.body_html) === normalizeHtml(expected);
    }
    const actual = product[field];
    if (field === "tags") {
      const normalize = (value) => (Array.isArray(value) ? value : String(value ?? "").split(",")).map((x) => x.trim()).filter(Boolean).sort();
      return JSON.stringify(normalize(actual)) === JSON.stringify(normalize(expected));
    }
    return String(actual ?? "") === String(expected ?? "");
}

function mismatchFields(product, patch) {
  return Object.entries(patch).filter(([field, expected]) => !fieldMatches(product, field, expected)).map(([field]) => field);
}

function matches(product, patch) {
  return mismatchFields(product, patch).length === 0;
}

async function readProduct(productId) {
  const response = await shopifyApi("GET", `products/${productId}.json`);
  if (!response.product) throw new Error(`Shopify returned no product ${productId}`);
  const meta = await shopifyApi("GET", `products/${productId}/metafields.json?limit=250`);
  const find = (key) => (meta.metafields ?? []).find((m) => m.namespace === "global" && m.key === key) ?? null;
  const title = find("title_tag");
  const description = find("description_tag");
  return { ...response.product, seo_title: title?.value ?? null, seo_description: description?.value ?? null,
    _seo_metafields: { title_tag: title, description_tag: description } };
}

async function writeSeoMetafield(productId, current, key, value) {
  const existing = current._seo_metafields?.[key];
  const metafield = { namespace: "global", key, type: existing?.type ?? "single_line_text_field", value: String(value ?? "") };
  if (existing?.id) await shopifyApi("PUT", `metafields/${existing.id}.json`, { metafield: { ...metafield, id: existing.id } });
  else await shopifyApi("POST", `products/${productId}/metafields.json`, { metafield });
}

async function writePatch(productId, patch, current) {
  const product = { id: productId };
  for (const field of ["title", "body_html", "vendor", "product_type", "tags", "status"]) if (field in patch) product[field] = patch[field];
  if ("image_alts" in patch) product.images = current.images.map((image, i) => ({ id: image.id, alt: patch.image_alts[i] }));
  if (Object.keys(product).length > 1) await shopifyApi("PUT", `products/${productId}.json`, { product });
  if ("seo_title" in patch) await writeSeoMetafield(productId, current, "title_tag", patch.seo_title);
  if ("seo_description" in patch) await writeSeoMetafield(productId, current, "description_tag", patch.seo_description);
  for (const [variantId, price] of Object.entries(patch.variant_prices ?? {})) {
    await shopifyApi("PUT", `variants/${variantId}.json`, { variant: { id: variantId, price } });
  }
}

function rollbackPatch(before, patch) {
  const rollback = {};
  for (const field of Object.keys(patch)) {
    if (field === "variant_prices") rollback.variant_prices = Object.fromEntries(Object.keys(patch.variant_prices).map((id) => [id, before.variants.find((v) => String(v.id) === String(id))?.price]));
    else if (field === "image_alts") rollback.image_alts = before.images.map((image) => image.alt ?? "");
    else rollback[field] = before[field];
  }
  return rollback;
}

export async function publishVerifiedProductPatch({ productId, patch, artifactKey, artifactHash, verificationKind = "content" }) {
  validatePatch(patch);
  requirePassingVerification({ artifactKey, artifactHash, kind: verificationKind });
  await initShopify();

  const operationKey = `shopify:product:update:${productId}:${artifactHash}`;
  const reservation = reserveOperation({ operationKey, kind: "shopify.product.update", request: { productId, patch, artifactKey, artifactHash } });
  if (!reservation.reserved) {
    if (reservation.reason === "complete") return reservation.result;
    throw new Error(`Publish already in progress for Shopify product ${productId}`);
  }
  const operationId = reservation.operation.id;
  const before = await readProduct(productId);

  // A previous response may have been lost after Shopify committed the update. Reconcile live
  // state before writing; if it already matches, record success without repeating the mutation.
  if (matches(before, patch)) {
    const result = { productId, operationKey, reconciled: true, product: before };
    completeOperation(operationId, result);
    return result;
  }

  const existingVersion = ensure().prepare("SELECT id FROM shopify_publish_versions WHERE operation_key=?").get(operationKey);
  const versionId = existingVersion?.id ?? randomUUID();
  ensure().prepare(`INSERT INTO shopify_publish_versions
    (id,operation_key,product_id,artifact_key,artifact_hash,before_doc,intended_doc,status,created_at)
    VALUES(?,?,?,?,?,?,?,'publishing',?)
    ON CONFLICT(operation_key) DO UPDATE SET before_doc=excluded.before_doc,
      intended_doc=excluded.intended_doc,live_doc=NULL,status='publishing',created_at=excluded.created_at,
      completed_at=NULL,error=NULL`)
    .run(versionId, operationKey, String(productId), artifactKey, artifactHash, JSON.stringify(before), JSON.stringify(patch), new Date().toISOString());

  let wrote = false;
  try {
    await writePatch(productId, patch, before);
    wrote = true;
    const live = await readProduct(productId);
    const mismatches = mismatchFields(live, patch);
    if (mismatches.length) throw new Error(`Live Shopify read-after-write mismatch: ${mismatches.join(", ")}`);
    ensure().prepare("UPDATE shopify_publish_versions SET status='verified',live_doc=?,completed_at=? WHERE id=?")
      .run(JSON.stringify(live), new Date().toISOString(), versionId);
    const result = { productId, operationKey, versionId, reconciled: false, product: live };
    completeOperation(operationId, result);
    return result;
  } catch (error) {
    if (wrote) {
      const rollback = rollbackPatch(before, patch);
      try {
        await writePatch(productId, rollback, before);
        const restored = await readProduct(productId);
        if (!matches(restored, rollback)) throw new Error("Rollback read-after-write mismatch");
        ensure().prepare("UPDATE shopify_publish_versions SET status='rolled_back',live_doc=?,completed_at=?,error=? WHERE id=?")
          .run(JSON.stringify(restored), new Date().toISOString(), error.message, versionId);
      } catch (rollbackError) {
        ensure().prepare("UPDATE shopify_publish_versions SET status='rollback_failed',completed_at=?,error=? WHERE id=?")
          .run(new Date().toISOString(), `${error.message}; rollback: ${rollbackError.message}`.slice(0, 2000), versionId);
      }
    }
    try { failOperation(operationId, error.message); } catch {}
    throw error;
  }
}
