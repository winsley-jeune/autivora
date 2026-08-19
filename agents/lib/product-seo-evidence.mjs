// Product-level organic + Shopping evidence. Refreshes are deliberately capped and durable;
// catalog agents consume this instead of inventing target queries from product titles.
import { openDb } from "./db.mjs";
import { createHash } from "node:crypto";
import { keywordSuggestions, keywordOverview, serpTop, googleShoppingProducts } from "./dataforseo.mjs";
import { assignQueryOwner } from "./page-ownership.mjs";
import { managedCatalogScope } from "./catalog-scope.mjs";

function cleanSeed(value) {
  return String(value ?? "").replace(/\bautivara\b/gi, "").split(/[—|]/)[0].replace(/[^a-z0-9 -]/gi, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

export function productSeeds(product) {
  const seeds = [cleanSeed(product.title), cleanSeed(product.product_type)];
  const usefulTag = product.tags.find((tag) => /diffuser|fragrance|oil|scent/i.test(tag));
  if (usefulTag) seeds.push(cleanSeed(usefulTag.replace(/-/g, " ")));
  return [...new Set(seeds.filter((seed) => seed.length >= 4))].slice(0, 3);
}

export function productFingerprint(product) {
  return createHash("sha256").update(JSON.stringify({
    title: product.title, productType: product.product_type,
    tags: [...(product.tags ?? [])].map((tag) => tag.toLowerCase()).sort(),
  })).digest("hex");
}

// Categories are the primary cold-start unit. One sound market study can ground sibling SKUs;
// product-specific research remains useful for mechanism/material/feature queries.
export function seoCategoryForProduct(product) {
  const text = [product.title, product.product_type, ...(product.tags ?? [])].join(" ");
  // Consumable oils remain in scents even when their label/use case says commercial or HVAC.
  if (/fragrance.?oil|\brefills?\b|essential.?oil|scent.?oil/i.test(text)) return "scents";
  if (/blend/i.test(text) && !/machine|device|waterless|diffuser.?system/i.test(text)) return "scents";
  if (/hvac|commercial|hotel|mall|office|business|atmos/i.test(text)) return "industrial";
  if (/humidor|cigar|cedar|hygrometer/i.test(text)) return "cedar-gift";
  if (/car|vent|vehicle|auto(?!matic)/i.test(text)) return "auto";
  return "home";
}

export function seoOpportunityScore(row) {
  const intent = row.intent === "transactional" ? 1.35 : row.intent === "commercial" ? 1.15 : 0.35;
  const feasibility = row.difficulty == null ? 0.5 : Math.max(0.1, (100 - row.difficulty) / 100);
  const value = 1 + Math.log1p(row.cpc ?? 0);
  return Number((Math.log1p(row.volume ?? 0) * intent * feasibility * value).toFixed(4));
}

export function isMarketEvidenceComplete({ seeds, keywords, serp }) {
  return Boolean(seeds?.length && keywords?.length
    && Object.values(serp ?? {}).some((results) => Array.isArray(results) && results.length));
}

export function canonicalKeyword(keyword) {
  const stop = new Set(["a", "an", "the", "for", "in", "of", "to"]);
  return String(keyword).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/)
    .filter((token) => token && !stop.has(token)).map((token) => token.endsWith("s") && token.length > 4 ? token.slice(0, -1) : token)
    .sort().join(" ");
}

const FOREIGN_BRAND = /\b(pura|feliway|aroma360|aromatech|hotel collection|vitruvi|yankee candle|little trees)\b/i;

let ready = false;
function ensure() {
  const d = openDb();
  if (ready) return d;
  d.exec(`CREATE TABLE IF NOT EXISTS product_seo_evidence (
    product_id TEXT PRIMARY KEY, catalog_hash TEXT NOT NULL, observed_at TEXT NOT NULL,
    expires_at TEXT NOT NULL, complete INTEGER NOT NULL CHECK(complete IN (0,1)), evidence TEXT NOT NULL
  ) WITHOUT ROWID;`);
  ready = true;
  return d;
}

export function getProductSeoEvidence(productId) {
  const row = ensure().prepare("SELECT evidence FROM product_seo_evidence WHERE product_id=?").get(String(productId));
  return row ? JSON.parse(row.evidence) : null;
}

export function listProductSeoEvidence() {
  return ensure().prepare("SELECT evidence FROM product_seo_evidence ORDER BY product_id").all().map((row) => JSON.parse(row.evidence));
}

export function productSeoCoverage(snapshot, now = new Date()) {
  const expected = managedCatalogScope(snapshot).products;
  const byId = new Map(listProductSeoEvidence().map((row) => [String(row.productId), row]));
  const usable = expected.filter((product) => {
    const row = byId.get(String(product.id));
    return row?.complete && row.catalogHash === snapshot.hash && Date.parse(row.expiresAt) > now.getTime();
  });
  const evidence = usable.map((product) => byId.get(String(product.id))).sort((a, b) => String(a.productId).localeCompare(String(b.productId)));
  return { expected: expected.length, complete: usable.length, ready: usable.length === expected.length,
    hash: createHash("sha256").update(JSON.stringify(evidence)).digest("hex"), missingProductIds: expected.filter((p) => !usable.includes(p)).map((p) => p.id) };
}

function usableEvidence(row, productsById, now) {
  const source = productsById.get(String(row?.productId));
  return Boolean(row?.complete && isMarketEvidenceComplete(row) && source && Date.parse(row.expiresAt) > now.getTime()
    && (!row.productFingerprint || row.productFingerprint === productFingerprint(source)));
}

export function categorySeoCoverage(snapshot, now = new Date()) {
  const products = managedCatalogScope(snapshot).products;
  const productsById = new Map(products.map((product) => [String(product.id), product]));
  const categories = [...new Set(products.map(seoCategoryForProduct))].sort();
  const rows = listProductSeoEvidence().filter((row) => usableEvidence(row, productsById, now));
  const evidenceByCategory = new Map();
  for (const row of rows) {
    const source = productsById.get(String(row.productId));
    const category = seoCategoryForProduct(source);
    if (row.category && row.category !== category) continue;
    if (!evidenceByCategory.has(category)) evidenceByCategory.set(category, []);
    evidenceByCategory.get(category).push(row);
  }
  const missingCategories = categories.filter((category) => !evidenceByCategory.get(category)?.length);
  const evidence = categories.flatMap((category) => evidenceByCategory.get(category) ?? []);
  return { expected: categories.length, complete: categories.length - missingCategories.length,
    ready: missingCategories.length === 0, categories, missingCategories, evidenceByCategory,
    hash: createHash("sha256").update(JSON.stringify(evidence)).digest("hex") };
}

export function seoEvidenceForProduct(product, snapshot, now = new Date()) {
  const direct = getProductSeoEvidence(product.id);
  const productsById = new Map(snapshot.products.map((p) => [String(p.id), p]));
  if (usableEvidence(direct, productsById, now)) return { ...direct, evidenceScope: "product" };
  const category = seoCategoryForProduct(product);
  const inherited = categorySeoCoverage(snapshot, now).evidenceByCategory.get(category)?.[0] ?? null;
  return inherited ? { ...inherited, evidenceScope: "category", appliesToProductId: product.id, category } : null;
}

const BROAD_SURFACES = [
  { test: (tokens) => tokens.includes("oil") && (tokens.includes("fragrance") || tokens.includes("diffuser") || tokens.includes("scent")), url: "/scents", key: "scents" },
  { test: (tokens) => tokens.includes("car") && tokens.includes("diffuser") && tokens.every((t) => ["car","diffuser","scent","aroma"].includes(t)), url: "/auto", key: "auto" },
  { test: (tokens) => tokens.includes("home") && tokens.includes("diffuser") && tokens.every((t) => ["home","diffuser","scent","aroma"].includes(t)), url: "/home", key: "home" },
  { test: (tokens) => (tokens.includes("commercial") || tokens.includes("hvac")) && tokens.includes("diffuser") && tokens.every((t) => ["commercial","hvac","diffuser","scent","aroma"].includes(t)), url: "/industrial", key: "industrial" },
];

export function proposeProductQueryOwners(evidenceRows) {
  const winners = new Map();
  for (const evidence of evidenceRows) {
    for (const keyword of evidence.keywords ?? []) {
      const clusterKey = keyword.clusterKey ?? canonicalKeyword(keyword.keyword);
      const tokens = clusterKey.split(" ");
      const broad = BROAD_SURFACES.find((surface) => surface.test(tokens));
      const proposal = broad
        ? { clusterKey, query: keyword.keyword, intent: "category", ownerUrl: broad.url, ownerType: "category", score: keyword.opportunityScore, productId: null }
        : { clusterKey, query: keyword.keyword, intent: "product", ownerUrl: `/product/${evidence.handle}`, ownerType: "product", score: keyword.opportunityScore, productId: evidence.productId };
      const current = winners.get(clusterKey);
      if (!current || (proposal.ownerType === "category" && current.ownerType !== "category") || proposal.score > current.score) winners.set(clusterKey, proposal);
    }
  }
  return [...winners.values()].sort((a, b) => b.score - a.score);
}

export function reconcileProductQueryOwners() {
  const proposals = proposeProductQueryOwners(listProductSeoEvidence());
  for (const proposal of proposals) assignQueryOwner({
    clusterKey: proposal.clusterKey, query: proposal.query, intent: proposal.intent,
    ownerUrl: proposal.ownerUrl, ownerType: proposal.ownerType,
    rationale: "DataForSEO commercial demand ownership; broad classes belong to category surfaces and specific mechanisms to the strongest product match.",
    evidence: { source: "dataforseo", opportunityScore: proposal.score, productId: proposal.productId },
  });
  return proposals;
}

export async function refreshProductSeoEvidence(product, { catalogHash, maxAgeMs = 30 * 864e5 } = {}) {
  const seeds = productSeeds(product);
  const suggestions = [];
  for (const seed of seeds) suggestions.push(...((await keywordSuggestions(seed, { limit: 30 })) ?? []));
  const unique = [...new Map(suggestions.map((row) => [row.keyword.toLowerCase(), row])).values()];
  const overview = (await keywordOverview(unique.slice(0, 100).map((row) => row.keyword))) ?? unique;
  const qualified = overview.map((row) => ({ ...row, opportunityScore: seoOpportunityScore(row) }))
    .filter((row) => ["commercial", "transactional"].includes(row.intent) && row.volume > 0 && !FOREIGN_BRAND.test(row.keyword))
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
  const clusters = new Map();
  for (const row of qualified) {
    const key = canonicalKeyword(row.keyword);
    const existing = clusters.get(key);
    if (!existing) clusters.set(key, { ...row, clusterKey: key, variants: [row.keyword] });
    else existing.variants.push(row.keyword);
  }
  const keywords = [...clusters.values()].slice(0, 20);
  const serp = {};
  for (const row of keywords.slice(0, 3)) serp[row.keyword] = await serpTop(row.keyword, { limit: 10 }) ?? [];
  const shoppingKeyword = keywords[0]?.keyword ?? seeds[0];
  const shopping = shoppingKeyword ? await googleShoppingProducts(shoppingKeyword, { depth: 20 }) : [];
  const purchasableShopping = (shopping ?? []).filter((offer) => Number.isFinite(Number(offer.price)) && Number(offer.price) > 0 && offer.seller);
  const observedAt = new Date();
  const evidence = { productId: product.id, handle: product.handle, category: seoCategoryForProduct(product),
    productFingerprint: productFingerprint(product), catalogHash, observedAt: observedAt.toISOString(),
    expiresAt: new Date(observedAt.getTime() + maxAgeMs).toISOString(),
    complete: isMarketEvidenceComplete({ seeds, keywords, serp }),
    seeds, keywords, serp, shoppingKeyword, shopping: purchasableShopping };
  ensure().prepare(`INSERT INTO product_seo_evidence(product_id,catalog_hash,observed_at,expires_at,complete,evidence)
    VALUES(?,?,?,?,?,?) ON CONFLICT(product_id) DO UPDATE SET catalog_hash=excluded.catalog_hash,observed_at=excluded.observed_at,expires_at=excluded.expires_at,complete=excluded.complete,evidence=excluded.evidence`)
    .run(String(product.id), catalogHash, evidence.observedAt, evidence.expiresAt, evidence.complete ? 1 : 0, JSON.stringify(evidence));
  return evidence;
}
