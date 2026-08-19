// Competitor espionage store — the operator directive made durable (2026-08-10): watch the
// ESTABLISHED winners' rankings to (a) choose organic content for our collections/products/
// blogs from demand they've proven, and (b) show Scout the next product to incorporate from
// keywords they monetize that we don't carry. Learn their map — never fight them head-on.
//
// Sweeps DataForSEO ranked-keywords per panel domain at most once per SWEEP_DAYS (cost
// control: ~4 Labs calls/sweep) into agents.db competitor_keywords; readers are free.
import { openDb, kvGet, kvSet } from "./db.mjs";
import { domainRankedKeywords, domainRelevantPages, organicCompetitorDomains } from "./dataforseo.mjs";

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
    PRIMARY KEY (domain, keyword)) WITHOUT ROWID;
    CREATE TABLE IF NOT EXISTS competitor_pages (
      domain TEXT NOT NULL, url TEXT NOT NULL, page_type TEXT NOT NULL, metrics TEXT NOT NULL,
      keyword_count INTEGER NOT NULL, total_keyword_volume INTEGER NOT NULL, best_position INTEGER,
      top_keywords TEXT NOT NULL, day TEXT NOT NULL, PRIMARY KEY(domain,url)
    ) WITHOUT ROWID;
    CREATE TABLE IF NOT EXISTS competitor_domains (
      domain TEXT PRIMARY KEY, intersections INTEGER NOT NULL, avg_position REAL,
      metrics TEXT NOT NULL, competitor_metrics TEXT NOT NULL, day TEXT NOT NULL
    ) WITHOUT ROWID;`);
  return d;
}

export function classifyCommercialPage(url) {
  let path;
  try { path = new URL(url).pathname.toLowerCase(); } catch { return "unknown"; }
  if (/\/(products?|p)\//.test(path)) return "product";
  if (/\/(collections?|category|shop)(\/|$)/.test(path)) return "category";
  if (/\/(blog|blogs|articles?|guides?)\//.test(path)) return "supporting";
  return "other";
}

export function commercialOpportunityScore({ totalKeywordVolume = 0, keywordCount = 0, bestPosition = 100, pageType = "other", ourPosition = null }) {
  const commercialWeight = pageType === "product" ? 1.2 : pageType === "category" ? 1.35 : pageType === "supporting" ? 0.45 : 0.25;
  const rankProof = Math.max(0.1, (21 - Math.min(20, bestPosition ?? 20)) / 20);
  const gapWeight = ourPosition == null ? 1 : Math.min(1, Math.max(0.15, (ourPosition - bestPosition) / 20));
  return Number((Math.log1p(totalKeywordVolume) * Math.log1p(keywordCount) * commercialWeight * rankProof * gapWeight).toFixed(4));
}

function rebuildPageEvidence(d, domain, relevantPages, day) {
  const keywords = d.prepare("SELECT keyword,volume,position,url FROM competitor_keywords WHERE domain=? ORDER BY volume DESC").all(domain);
  const byUrl = new Map();
  for (const row of keywords) {
    if (!row.url) continue;
    const list = byUrl.get(row.url) ?? [];
    list.push(row);
    byUrl.set(row.url, list);
  }
  for (const page of relevantPages ?? []) if (!byUrl.has(page.url)) byUrl.set(page.url, []);
  const metricsByUrl = new Map((relevantPages ?? []).map((p) => [p.url, p.metrics]));
  d.prepare("DELETE FROM competitor_pages WHERE domain=?").run(domain);
  const ins = d.prepare(`INSERT INTO competitor_pages(domain,url,page_type,metrics,keyword_count,total_keyword_volume,best_position,top_keywords,day) VALUES(?,?,?,?,?,?,?,?,?)`);
  for (const [url, rows] of byUrl) {
    ins.run(domain, url, classifyCommercialPage(url), JSON.stringify(metricsByUrl.get(url) ?? {}), rows.length,
      rows.reduce((sum, row) => sum + (row.volume ?? 0), 0), rows.length ? Math.min(...rows.map((r) => r.position ?? 100)) : null,
      JSON.stringify(rows.slice(0, 10).map(({ keyword, volume, position }) => ({ keyword, volume, position }))), day);
  }
}

export async function sweepIfStale() {
  const d = ensure();
  const last = kvGet(SWEEP_KEY);
  if (last && Date.now() - Date.parse(last) < SWEEP_DAYS * 864e5) return false;
  const day = new Date().toISOString().slice(0, 10);
  let swept = 0;
  const discovered = await organicCompetitorDomains(SELF, { limit: 25 });
  if (discovered) {
    d.prepare("DELETE FROM competitor_domains").run();
    const insertDomain = d.prepare("INSERT INTO competitor_domains(domain,intersections,avg_position,metrics,competitor_metrics,day) VALUES(?,?,?,?,?,?)");
    for (const row of discovered) insertDomain.run(row.domain, row.intersections, row.avgPosition, JSON.stringify(row.metrics), JSON.stringify(row.competitorMetrics), day);
  }
  for (const domain of [SELF, ...COMPETITORS]) {
    const [rows, pages] = await Promise.all([domainRankedKeywords(domain, { limit: 250 }), domainRelevantPages(domain, { limit: 50 })]);
    if (!rows) continue; // fail-soft: keep old rows for this domain
    d.prepare("DELETE FROM competitor_keywords WHERE domain = ?").run(domain);
    const ins = d.prepare("INSERT OR REPLACE INTO competitor_keywords (domain, keyword, volume, position, url, day) VALUES (?, ?, ?, ?, ?, ?)");
    for (const r of rows) ins.run(domain, r.keyword, r.volume, r.position, r.url, day);
    rebuildPageEvidence(d, domain, pages, day);
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
  const pageRows = d.prepare(`SELECT domain,url,page_type,metrics,keyword_count,total_keyword_volume,best_position,top_keywords
    FROM competitor_pages WHERE domain != ? AND page_type IN ('product','category')
    ORDER BY total_keyword_volume DESC,keyword_count DESC LIMIT ?`).all(SELF, Math.min(limit, 30));
  const domains = d.prepare("SELECT domain,intersections,avg_position,metrics FROM competitor_domains WHERE domain != ? ORDER BY intersections DESC LIMIT 15").all(SELF);
  return {
    note: "HEAD-TO-HEAD: keywords ESTABLISHED competitors rank top-20 for (DataForSEO, weekly sweep), each annotated with OUR current position (our_position null = we are absent — the gap). Sales happen on collection/product pages: beat the top of the top there; blogs are support. Spot products they monetize that we do not carry. Never target their brand terms head-on.",
    sweptAt: kvGet(SWEEP_KEY),
    our_ranked_keyword_count: ours.size,
    keywords: rows.map((r) => ({ ...r, our_position: ours.get(r.keyword)?.position ?? null, our_url: ours.get(r.keyword)?.url ?? null })),
    winning_commercial_pages: pageRows.map((row) => {
      const topKeywords = JSON.parse(row.top_keywords);
      const ourPositions = topKeywords.map((k) => ours.get(k.keyword)?.position).filter((v) => v != null);
      const ourPosition = ourPositions.length ? Math.min(...ourPositions) : null;
      return { ...row, metrics: JSON.parse(row.metrics), top_keywords: topKeywords, our_best_position: ourPosition,
        opportunity_score: commercialOpportunityScore({ totalKeywordVolume: row.total_keyword_volume, keywordCount: row.keyword_count, bestPosition: row.best_position, pageType: row.page_type, ourPosition }) };
    }).sort((a, b) => b.opportunity_score - a.opportunity_score),
    discovered_competitors: domains.map((row) => ({ ...row, metrics: JSON.parse(row.metrics) })),
  };
}

// Our own top-20 rankings from the same sweep — what Autivara actually holds today.
export function ourRankings({ limit = 50 } = {}) {
  return ensure().prepare("SELECT keyword, volume, position, url FROM competitor_keywords WHERE domain = ? ORDER BY volume DESC LIMIT ?").all(SELF, limit);
}
