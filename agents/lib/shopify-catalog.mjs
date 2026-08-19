// Complete Shopify catalog ingestion for autonomous decision-making. This is the canonical
// read path: every status is paginated, SEO metafields are joined, and collections are mapped.
// Callers may inject an API function in tests; production uses the shared authenticated client.
import { createHash } from "node:crypto";
import { initShopify, shopifyApi } from "./shopify.mjs";
import { openDb, transactionSync } from "./db.mjs";

const STATUSES = ["active", "draft", "archived"];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function paginate(api, initialPath, key) {
  const rows = [];
  let path = initialPath;
  let pages = 0;
  while (path) {
    const response = await api("GET", path);
    rows.push(...(response[key] ?? []));
    pages += 1;
    path = response._linkNext ? `${initialPath.split("?")[0]}?limit=250&page_info=${response._linkNext}` : null;
  }
  return { rows, pages };
}

function seoFromMetafields(metafields) {
  const find = (key) => metafields.find((m) => m.namespace === "global" && m.key === key)?.value ?? null;
  return { title: find("title_tag"), description: find("description_tag") };
}

export async function pullCompleteShopifyCatalog({ api = shopifyApi, initialize = true, observedAt = new Date() } = {}) {
  if (initialize) await initShopify();
  const products = [];
  const pageCounts = {};
  for (const status of STATUSES) {
    const result = await paginate(api, `products.json?limit=250&status=${status}`, "products");
    products.push(...result.rows);
    pageCounts[status] = result.pages;
  }

  const [custom, smart, collects] = await Promise.all([
    paginate(api, "custom_collections.json?limit=250", "custom_collections"),
    paginate(api, "smart_collections.json?limit=250", "smart_collections"),
    paginate(api, "collects.json?limit=250", "collects"),
  ]);
  const collections = [...custom.rows, ...smart.rows];
  const collectionById = new Map(collections.map((c) => [String(c.id), c]));
  const memberships = new Map();
  for (const collect of collects.rows) {
    const collection = collectionById.get(String(collect.collection_id));
    if (!collection) continue;
    const list = memberships.get(String(collect.product_id)) ?? [];
    list.push({ id: collection.id, title: collection.title, handle: collection.handle });
    memberships.set(String(collect.product_id), list);
  }

  const normalized = [];
  for (const product of products) {
    const mf = await api("GET", `products/${product.id}/metafields.json?limit=250`);
    normalized.push({
      id: product.id,
      admin_graphql_api_id: product.admin_graphql_api_id ?? null,
      status: product.status,
      published_at: product.published_at ?? null,
      title: product.title,
      handle: product.handle,
      body_html: product.body_html ?? "",
      vendor: product.vendor ?? "",
      product_type: product.product_type ?? "",
      tags: Array.isArray(product.tags) ? product.tags : String(product.tags ?? "").split(",").map((x) => x.trim()).filter(Boolean),
      seo: seoFromMetafields(mf.metafields ?? []),
      variants: (product.variants ?? []).map((v) => ({
        id: v.id, sku: v.sku ?? "", title: v.title, price: Number(v.price),
        compare_at_price: v.compare_at_price == null ? null : Number(v.compare_at_price),
        inventory_quantity: v.inventory_quantity ?? null, inventory_management: v.inventory_management ?? null,
      })),
      images: (product.images ?? []).map((image) => ({ id: image.id, position: image.position, src: image.src, alt: image.alt ?? null })),
      collections: memberships.get(String(product.id)) ?? [],
      updated_at: product.updated_at ?? null,
    });
    if (initialize) await sleep(550);
  }

  const payload = { observedAt: observedAt.toISOString(), complete: true, products: normalized, collections };
  payload.hash = createHash("sha256").update(JSON.stringify(payload.products)).digest("hex");
  payload.completeness = {
    productCount: normalized.length,
    statusCounts: Object.fromEntries(STATUSES.map((s) => [s, normalized.filter((p) => p.status === s).length])),
    pages: { products: pageCounts, customCollections: custom.pages, smartCollections: smart.pages, collects: collects.pages },
    metafieldsJoined: normalized.length,
  };
  return payload;
}

let ready = false;
function ensure() {
  const d = openDb();
  if (ready) return d;
  d.exec(`CREATE TABLE IF NOT EXISTS shopify_catalog_snapshots (
    hash TEXT PRIMARY KEY, observed_at TEXT NOT NULL, complete INTEGER NOT NULL CHECK(complete IN (0,1)),
    product_count INTEGER NOT NULL, completeness TEXT NOT NULL, payload TEXT NOT NULL
  );`);
  ready = true;
  return d;
}

export function recordShopifyCatalogSnapshot(snapshot) {
  if (!snapshot?.complete || !snapshot.hash || !Array.isArray(snapshot.products)) throw new Error("Refusing to record an incomplete Shopify catalog snapshot");
  return transactionSync((d) => {
    ensure();
    d.prepare(`INSERT INTO shopify_catalog_snapshots(hash,observed_at,complete,product_count,completeness,payload)
      VALUES(?,?,1,?,?,?) ON CONFLICT(hash) DO UPDATE SET observed_at=excluded.observed_at,completeness=excluded.completeness,payload=excluded.payload`)
      .run(snapshot.hash, snapshot.observedAt, snapshot.products.length, JSON.stringify(snapshot.completeness), JSON.stringify(snapshot));
    return snapshot;
  });
}

export function latestShopifyCatalogSnapshot() {
  const row = ensure().prepare("SELECT payload FROM shopify_catalog_snapshots ORDER BY observed_at DESC LIMIT 1").get();
  return row ? JSON.parse(row.payload) : null;
}
