// One commercial query cluster has one primary owner. Blogs may support commercial intent but may
// never own it, preventing the current failure mode where traffic lands on a page with no offer.
import { openDb, transactionSync } from "./db.mjs";

const COMMERCIAL_INTENTS = new Set(["category", "product"]);
let ready = false;
function ensure() {
  const d = openDb();
  if (ready) return d;
  d.exec(`
    CREATE TABLE IF NOT EXISTS query_owners (
      cluster_key TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      intent TEXT NOT NULL CHECK(intent IN ('category','product','supporting')),
      owner_url TEXT NOT NULL,
      owner_type TEXT NOT NULL CHECK(owner_type IN ('category','product','blog')),
      rationale TEXT NOT NULL,
      evidence TEXT NOT NULL,
      updated_at TEXT NOT NULL
    ) WITHOUT ROWID;
  `);
  ready = true;
  return d;
}

export function assignQueryOwner({ clusterKey, query, intent, ownerUrl, ownerType, rationale, evidence = {} }) {
  if (!clusterKey || !query || !ownerUrl || !rationale) throw new Error("Query ownership requires clusterKey, query, ownerUrl, and rationale");
  if (COMMERCIAL_INTENTS.has(intent) && !["category", "product"].includes(ownerType)) {
    throw new Error(`Commercial intent "${intent}" cannot be owned by ${ownerType}; assign a category or product page`);
  }
  if (intent === "category" && ownerType !== "category") throw new Error("Category intent must be owned by a category page");
  if (intent === "product" && ownerType !== "product") throw new Error("Product intent must be owned by a product page");
  ensure();
  return transactionSync((d) => {
    d.prepare(`INSERT INTO query_owners(cluster_key,query,intent,owner_url,owner_type,rationale,evidence,updated_at)
      VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(cluster_key) DO UPDATE SET query=excluded.query,intent=excluded.intent,
      owner_url=excluded.owner_url,owner_type=excluded.owner_type,rationale=excluded.rationale,evidence=excluded.evidence,updated_at=excluded.updated_at`)
      .run(clusterKey, query, intent, ownerUrl, ownerType, rationale, JSON.stringify(evidence), new Date().toISOString());
    return getQueryOwner(clusterKey);
  });
}

export function getQueryOwner(clusterKey) {
  const row = ensure().prepare("SELECT * FROM query_owners WHERE cluster_key = ?").get(clusterKey);
  return row ? { ...row, evidence: JSON.parse(row.evidence) } : null;
}

export function listQueryOwners() {
  return ensure().prepare("SELECT * FROM query_owners ORDER BY cluster_key").all().map((row) => ({ ...row, evidence: JSON.parse(row.evidence) }));
}
