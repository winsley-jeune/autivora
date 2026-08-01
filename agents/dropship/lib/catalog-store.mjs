// The dropship catalog — single source of truth for everything Scout sources, replacing the
// five scratch dotfiles (.sweep-results, .delivery-check-results, .*-full-detail) and the
// hardcoded ID arrays that previously lived pasted across one-off scripts.
//
// Same single-writer / lock / atomic-rename discipline as agents/signal/lib/task-store.mjs —
// see that file for why (lost-update bugs once two processes touch the same JSON).
//
// Shape:
//   products:  [{ itemId, skuId, tier, collection, title, shopifyId, status, landedCost,
//                 price, priceMultiple, stock, deliveryMin, deliveryMax, shipFrom,
//                 rating, reviews, orders, channelEligibility, competition, marketingAngle,
//                 importedOn, lastVerifiedOn, verifyHistory: [{on, ok, stock, note}] }]
//   rejected:  { [itemId]: { reason, on } }          — cooldown list; don't re-verify for 30d
//   keywordQueue:   { [tier]: [keyword, ...] }        — what to scan next (Scout replenishes)
//   keywordHistory: { [tier]: { [keyword]: { lastRun, totalCount, returned, imported, apiErrors } } }
//   lessons:   [{ on, lesson }]                       — Scout's own run-over-run memory
import { readFileSync, writeFileSync, mkdirSync, existsSync, openSync, closeSync, unlinkSync, statSync, renameSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = join(__dir, "..", "state");
const STORE_PATH = join(STATE_DIR, "catalog.json");
const LOCK_PATH = join(STATE_DIR, "catalog.lock");
const LOCK_STALE_MS = 60_000;
const LOCK_RETRY_MS = 100;
const LOCK_TIMEOUT_MS = 10_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const EMPTY = { products: [], rejected: {}, keywordQueue: {}, keywordHistory: {}, lessons: [], pendingApprovals: [] };

async function acquireLock() {
  mkdirSync(STATE_DIR, { recursive: true });
  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  for (;;) {
    try {
      closeSync(openSync(LOCK_PATH, "wx"));
      return;
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
      const age = (() => { try { return Date.now() - statSync(LOCK_PATH).mtimeMs; } catch { return Infinity; } })();
      if (age > LOCK_STALE_MS) { try { unlinkSync(LOCK_PATH); } catch {} continue; }
      if (Date.now() > deadline) throw new Error("catalog.json lock timed out — check agents/dropship/state/catalog.lock");
      await sleep(LOCK_RETRY_MS);
    }
  }
}

export function loadCatalog() {
  if (!existsSync(STORE_PATH)) return structuredClone(EMPTY);
  return { ...structuredClone(EMPTY), ...JSON.parse(readFileSync(STORE_PATH, "utf8")) };
}

export async function mutateCatalog(mutator) {
  await acquireLock();
  try {
    const store = loadCatalog();
    const result = mutator(store);
    const tmp = STORE_PATH + ".tmp";
    writeFileSync(tmp, JSON.stringify(store, null, 2));
    renameSync(tmp, STORE_PATH);
    return result;
  } finally {
    try { unlinkSync(LOCK_PATH); } catch {}
  }
}
