// The dropship catalog — single source of truth for everything Scout sources.
//
// SINGLE-WRITER RULE: same discipline as agents/signal/lib/task-store.mjs — all mutation goes
// through mutateCatalog(), which runs the whole read-modify-write cycle inside one SQLite
// write transaction in agents/state/agents.db (agents/lib/db.mjs). The old catalog.json with
// its lock file and tmp+rename write is auto-imported on first open.
//
// Materialized shape (what mutators and readers see — unchanged from the JSON era):
//   products:  [{ itemId, skuId, tier, collection, title, shopifyId, status, landedCost,
//                 price, priceMultiple, stock, deliveryMin, deliveryMax, shipFrom,
//                 rating, reviews, orders, channelEligibility, competition, marketingAngle,
//                 importedOn, lastVerifiedOn, verifyHistory: [{on, ok, stock, note}] }]
//   rejected:  { [itemId]: { reason, on } }          — cooldown list; don't re-verify for 30d
//   keywordQueue:   { [tier]: [keyword, ...] }        — what to scan next (Scout replenishes)
//   keywordHistory: { [tier]: { [keyword]: { lastRun, totalCount, returned, imported, apiErrors } } }
//   lessons:   [{ on, lesson }]                       — Scout's own run-over-run memory
//   pendingApprovals / demandHypotheses: free-form arrays owned by Scout
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { openDb, withTransaction, importLegacyJson } from "../../lib/db.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const LEGACY_PATH = join(__dir, "..", "state", "catalog.json");

const EMPTY = { products: [], rejected: {}, keywordQueue: {}, keywordHistory: {}, lessons: [], pendingApprovals: [], demandHypotheses: [] };

let ready = false;
function ensureStore() {
  const d = openDb();
  if (ready) return d;
  d.exec(`
    CREATE TABLE IF NOT EXISTS dropship_products (
      pos     INTEGER PRIMARY KEY,
      item_id TEXT,
      doc     TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_dropship_products_item ON dropship_products(item_id);
    CREATE TABLE IF NOT EXISTS dropship_rejected (
      item_id TEXT PRIMARY KEY,
      doc     TEXT NOT NULL
    ) WITHOUT ROWID;
    CREATE TABLE IF NOT EXISTS dropship_keyword_queue (
      tier    TEXT NOT NULL,
      pos     INTEGER NOT NULL,
      keyword TEXT NOT NULL,
      PRIMARY KEY (tier, pos)
    ) WITHOUT ROWID;
    CREATE TABLE IF NOT EXISTS dropship_keyword_history (
      tier    TEXT NOT NULL,
      keyword TEXT NOT NULL,
      doc     TEXT NOT NULL,
      PRIMARY KEY (tier, keyword)
    ) WITHOUT ROWID;
    CREATE TABLE IF NOT EXISTS dropship_lists (
      list TEXT NOT NULL,     -- lessons | pendingApprovals | demandHypotheses
      pos  INTEGER NOT NULL,
      doc  TEXT NOT NULL,
      PRIMARY KEY (list, pos)
    ) WITHOUT ROWID;
  `);
  importLegacyJson("migrated.dropship_catalog", LEGACY_PATH, (parsed) => persist({ ...structuredClone(EMPTY), ...parsed }));
  ready = true;
  return d;
}

function persist(store) {
  const d = openDb();
  d.exec("DELETE FROM dropship_products; DELETE FROM dropship_rejected; DELETE FROM dropship_keyword_queue; DELETE FROM dropship_keyword_history; DELETE FROM dropship_lists;");
  const insProduct = d.prepare("INSERT INTO dropship_products (pos, item_id, doc) VALUES (?, ?, ?)");
  store.products.forEach((p, i) => insProduct.run(i, p.itemId != null ? String(p.itemId) : null, JSON.stringify(p)));
  const insRejected = d.prepare("INSERT INTO dropship_rejected (item_id, doc) VALUES (?, ?)");
  for (const [id, v] of Object.entries(store.rejected)) insRejected.run(String(id), JSON.stringify(v));
  const insQueue = d.prepare("INSERT INTO dropship_keyword_queue (tier, pos, keyword) VALUES (?, ?, ?)");
  for (const [tier, kws] of Object.entries(store.keywordQueue)) kws.forEach((kw, i) => insQueue.run(tier, i, kw));
  const insHistory = d.prepare("INSERT INTO dropship_keyword_history (tier, keyword, doc) VALUES (?, ?, ?)");
  for (const [tier, byKw] of Object.entries(store.keywordHistory)) {
    for (const [kw, v] of Object.entries(byKw)) insHistory.run(tier, kw, JSON.stringify(v));
  }
  const insList = d.prepare("INSERT INTO dropship_lists (list, pos, doc) VALUES (?, ?, ?)");
  for (const list of ["lessons", "pendingApprovals", "demandHypotheses"]) {
    (store[list] ?? []).forEach((item, i) => insList.run(list, i, JSON.stringify(item)));
  }
}

function materialize() {
  const d = ensureStore();
  const store = structuredClone(EMPTY);
  store.products = d.prepare("SELECT doc FROM dropship_products ORDER BY pos").all().map((r) => JSON.parse(r.doc));
  for (const r of d.prepare("SELECT item_id, doc FROM dropship_rejected").all()) store.rejected[r.item_id] = JSON.parse(r.doc);
  for (const r of d.prepare("SELECT tier, keyword FROM dropship_keyword_queue ORDER BY tier, pos").all()) {
    (store.keywordQueue[r.tier] ??= []).push(r.keyword);
  }
  for (const r of d.prepare("SELECT tier, keyword, doc FROM dropship_keyword_history").all()) {
    (store.keywordHistory[r.tier] ??= {})[r.keyword] = JSON.parse(r.doc);
  }
  for (const r of d.prepare("SELECT list, doc FROM dropship_lists ORDER BY list, pos").all()) store[r.list].push(JSON.parse(r.doc));
  return store;
}

export function loadCatalog() {
  ensureStore();
  return materialize();
}

export async function mutateCatalog(mutator) {
  ensureStore();
  return withTransaction(async () => {
    const store = materialize();
    const result = await mutator(store);
    persist(store);
    return result;
  });
}
