// Competitor espionage store — the operator directive made durable (2026-08-10): watch the
// ESTABLISHED winners' rankings to (a) choose organic content for our collections/products/
// blogs from demand they've proven, and (b) show Scout the next product to incorporate from
// keywords they monetize that we don't carry. Learn their map — never fight them head-on.
//
// Sweeps DataForSEO ranked-keywords per panel domain at most once per SWEEP_DAYS (cost
// control: ~4 Labs calls/sweep) into agents.db competitor_keywords; readers are free.
import { openDb, kvGet, kvSet } from "./db.mjs";
import { domainRankedKeywords } from "./dataforseo.mjs";

const COMPETITORS = ["pura.com", "aroma360.com", "aromatech.com", "hotelcollection.com"];
const SWEEP_KEY = "espionage.last_sweep";
const SWEEP_DAYS = 7;

function ensure() {
  const d = openDb();
  d.exec(`CREATE TABLE IF NOT EXISTS competitor_keywords (
    domain TEXT NOT NULL, keyword TEXT NOT NULL, volume INTEGER, position INTEGER, url TEXT, day TEXT,
    PRIMARY KEY (domain, keyword)) WITHOUT ROWID;`);
  return d;
}

export async function sweepIfStale() {
  const d = ensure();
  const last = kvGet(SWEEP_KEY);
  if (last && Date.now() - Date.parse(last) < SWEEP_DAYS * 864e5) return false;
  const day = new Date().toISOString().slice(0, 10);
  let swept = 0;
  for (const domain of COMPETITORS) {
    const rows = await domainRankedKeywords(domain, { limit: 100 });
    if (!rows) continue; // fail-soft: keep old rows for this domain
    d.prepare("DELETE FROM competitor_keywords WHERE domain = ?").run(domain);
    const ins = d.prepare("INSERT OR REPLACE INTO competitor_keywords (domain, keyword, volume, position, url, day) VALUES (?, ?, ?, ?, ?, ?)");
    for (const r of rows) ins.run(domain, r.keyword, r.volume, r.position, r.url, day);
    swept++;
  }
  if (swept) kvSet(SWEEP_KEY, new Date().toISOString());
  return swept > 0;
}

// Top competitor-proven keywords, highest volume first. productPagesOnly narrows to keywords
// they win with product/collection URLs — the strongest "this sells" signal.
export function competitorIntel({ limit = 40, productPagesOnly = false } = {}) {
  const d = ensure();
  const rows = d.prepare(`SELECT domain, keyword, volume, position, url FROM competitor_keywords
    ${productPagesOnly ? "WHERE url LIKE '%/products/%' OR url LIKE '%/collections/%' OR url LIKE '%/product/%'" : ""}
    ORDER BY volume DESC LIMIT ?`).all(limit);
  return {
    note: "Keywords ESTABLISHED competitors rank top-20 for (DataForSEO, weekly sweep). Use to pick organic content for our collection/product/blog pages and to spot products they monetize that we do not carry. Learn the map; do not target their brand terms head-on.",
    sweptAt: kvGet(SWEEP_KEY),
    keywords: rows,
  };
}
