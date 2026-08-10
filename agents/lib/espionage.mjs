// Competitor espionage store — the operator directive made durable (2026-08-10): watch the
// ESTABLISHED winners' rankings to (a) choose organic content for our collections/products/
// blogs from demand they've proven, and (b) show Scout the next product to incorporate from
// keywords they monetize that we don't carry. Learn their map — never fight them head-on.
//
// Sweeps DataForSEO ranked-keywords per panel domain at most once per SWEEP_DAYS (cost
// control: ~4 Labs calls/sweep) into agents.db competitor_keywords; readers are free.
import { openDb, kvGet, kvSet } from "./db.mjs";
import { domainRankedKeywords } from "./dataforseo.mjs";

const COMPETITORS = ["pura.com", "aroma360.com", "aromatech.com", "hotelcollection.com", "vitruvi.com"];
// Ourselves, swept identically — intel is a HEAD-TO-HEAD (their position vs ours per keyword),
// not a scouting report about strangers. Sales happen on collection/product pages; the job is
// beating the top of the top there, with blogs as support.
const SELF = "autivara.com";
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
  for (const domain of [SELF, ...COMPETITORS]) {
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
    WHERE domain != ? ${productPagesOnly ? "AND (url LIKE '%/products/%' OR url LIKE '%/collections/%' OR url LIKE '%/product/%')" : ""}
    ORDER BY volume DESC LIMIT ?`).all(SELF, limit);
  const ours = new Map(d.prepare("SELECT keyword, position, url FROM competitor_keywords WHERE domain = ?").all(SELF).map((r) => [r.keyword, r]));
  return {
    note: "HEAD-TO-HEAD: keywords ESTABLISHED competitors rank top-20 for (DataForSEO, weekly sweep), each annotated with OUR current position (our_position null = we are absent — the gap). Sales happen on collection/product pages: beat the top of the top there; blogs are support. Spot products they monetize that we do not carry. Never target their brand terms head-on.",
    sweptAt: kvGet(SWEEP_KEY),
    our_ranked_keyword_count: ours.size,
    keywords: rows.map((r) => ({ ...r, our_position: ours.get(r.keyword)?.position ?? null, our_url: ours.get(r.keyword)?.url ?? null })),
  };
}

// Our own top-20 rankings from the same sweep — what Autivara actually holds today.
export function ourRankings({ limit = 50 } = {}) {
  return ensure().prepare("SELECT keyword, volume, position, url FROM competitor_keywords WHERE domain = ? ORDER BY volume DESC LIMIT ?").all(SELF, limit);
}
