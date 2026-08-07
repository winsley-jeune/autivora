// Market observatory — demand measurement from real transaction data, not web articles.
//
// Design (operator critique, 2026-08-08): LLM web search observes what's been WRITTEN about
// demand — lagging, and anything visible enough to be an article is usually already served.
// But we hold API access to a marketplace exposing live order counts on millions of products.
// Order-count DELTAS over time are direct demand measurement: an item accelerating from a low
// base is emerging (the pre-saturation window we hunt); an item at 10k+ orders is anchored
// commodity (too late). This module owns the local store (SQLite via node:sqlite — the M5
// handles millions of rows locally) and the velocity math. Discovery becomes data; the model
// only judges the top of the funnel.
//
// Tables:
//   snapshots(item_id, day, keyword, tier, title, price, orders, rating)  PK(item_id, day)
//     — one row per item per day it was observed; orders is the cumulative count AliExpress
//       reports, so velocity = Δorders / Δdays between an item's snapshots.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dir, "..", "state", "observatory.db");

let db = null;
export function openObservatory() {
  if (db) return db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS snapshots (
      item_id TEXT NOT NULL,
      day     TEXT NOT NULL,
      keyword TEXT NOT NULL,
      tier    TEXT NOT NULL,
      title   TEXT,
      price   REAL,
      orders  INTEGER,
      rating  REAL,
      PRIMARY KEY (item_id, day)
    ) WITHOUT ROWID;
    CREATE INDEX IF NOT EXISTS idx_snapshots_day ON snapshots(day);
  `);
  return db;
}

export function recordSnapshots(rows, day) {
  const d = openObservatory();
  const stmt = d.prepare(
    "INSERT INTO snapshots (item_id, day, keyword, tier, title, price, orders, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?) " +
    "ON CONFLICT(item_id, day) DO UPDATE SET orders = excluded.orders, price = excluded.price",
  );
  let n = 0;
  for (const r of rows) {
    stmt.run(String(r.itemId), day, r.keyword, r.tier, r.title ?? null, r.price ?? null, r.orders ?? 0, r.rating ?? null);
    n++;
  }
  return n;
}

export function observatoryStats() {
  const d = openObservatory();
  const s = d.prepare("SELECT COUNT(DISTINCT item_id) items, COUNT(DISTINCT day) days, COUNT(*) rows FROM snapshots").get();
  return s;
}

// The core query: demand velocity per item across its observation window.
//   velocity  = Δorders/day between first and last snapshot (absolute demand growth)
//   momentum  = velocity / (base orders + 10)  (growth relative to base — surfaces items
//               accelerating from small bases, which is the emerging/pre-saturation profile;
//               +10 damps division noise on near-zero bases)
// maxBaseOrders excludes established commodities: an item already at thousands of orders is
// anchored territory regardless of its velocity.
export function demandMovers({ minDaysObserved = 2, maxBaseOrders = 3000, limit = 25 } = {}) {
  const d = openObservatory();
  return d.prepare(`
    WITH spans AS (
      SELECT item_id, MIN(day) first_day, MAX(day) last_day,
             COUNT(*) days_observed
      FROM snapshots GROUP BY item_id
      HAVING days_observed >= ? AND first_day < last_day
    )
    SELECT s.item_id,
           f.title, f.keyword, f.tier,
           l.price,
           f.orders AS base_orders,
           l.orders AS latest_orders,
           ROUND(CAST(l.orders - f.orders AS REAL) / (JULIANDAY(s.last_day) - JULIANDAY(s.first_day)), 2) AS velocity,
           ROUND(CAST(l.orders - f.orders AS REAL) / (JULIANDAY(s.last_day) - JULIANDAY(s.first_day)) / (f.orders + 10), 4) AS momentum,
           s.first_day, s.last_day, s.days_observed
    FROM spans s
    JOIN snapshots f ON f.item_id = s.item_id AND f.day = s.first_day
    JOIN snapshots l ON l.item_id = s.item_id AND l.day = s.last_day
    WHERE l.orders > f.orders AND f.orders <= ?
    ORDER BY momentum DESC
    LIMIT ?
  `).all(minDaysObserved, maxBaseOrders, limit);
}

// Category pulse: aggregate demand movement per panel keyword — tells the demand researcher
// which TERRITORIES are heating up even when no single item stands out yet.
export function categoryPulse({ limit = 20 } = {}) {
  const d = openObservatory();
  return d.prepare(`
    WITH per_item AS (
      SELECT item_id, keyword,
             MAX(orders) - MIN(orders) AS growth,
             COUNT(*) AS days
      FROM snapshots GROUP BY item_id, keyword HAVING days >= 2
    )
    SELECT keyword,
           COUNT(*) items_tracked,
           SUM(growth) total_new_orders,
           ROUND(AVG(growth), 1) avg_growth_per_item
    FROM per_item
    GROUP BY keyword
    HAVING total_new_orders > 0
    ORDER BY total_new_orders DESC
    LIMIT ?
  `).all(limit);
}
