// DataForSEO client — the agents' own pipeline for measured SEO data (operator call,
// 2026-08-10: the pipeline lives in THIS repo, not behind HarborRank's dev server, so the
// 7am loop never depends on another local app being up). HarborRank (~/Desktop/open-seo)
// remains the operator's UI over the same account; agents/lib/harborrank.mjs stays for
// site audits only.
//
// Auth: DATAFORSEO_API_KEY in .env — already base64("login:password"), used as Basic auth.
// Costs are pay-as-you-go (fractions of a cent per SERP/volume call) — callers batch and cap.
// Fail-soft: helpers return null on any failure; SEO enrichment must never kill a daily run.
import { readOptionalEnv } from "./env.mjs";

const BASE = "https://api.dataforseo.com/v3";

async function dfs(path, tasks) {
  const { DATAFORSEO_API_KEY } = readOptionalEnv(["DATAFORSEO_API_KEY"]);
  if (!DATAFORSEO_API_KEY) return null;
  try {
    const res = await fetch(`${BASE}/${path}`, {
      method: tasks ? "POST" : "GET",
      headers: { Authorization: `Basic ${DATAFORSEO_API_KEY}`, ...(tasks ? { "Content-Type": "application/json" } : {}) },
      body: tasks ? JSON.stringify(tasks) : undefined,
      signal: AbortSignal.timeout(60_000),
    });
    const json = await res.json();
    if (json.status_code !== 20000) throw new Error(`${json.status_code} ${json.status_message}`);
    return json;
  } catch (e) {
    console.warn(`DataForSEO unavailable (${String(e.message).slice(0, 120)}) — continuing without it.`);
    return null;
  }
}

export async function accountBalance() {
  const json = await dfs("appendix/user_data");
  return json?.tasks?.[0]?.result?.[0]?.money?.balance ?? null;
}

// Monthly US search volumes for up to 1000 keywords in ONE billed call.
// Returns { [keyword]: { volume, cpc, competition } } or null.
export async function keywordVolumes(keywords) {
  if (!keywords?.length) return {};
  const json = await dfs("keywords_data/google_ads/search_volume/live", [
    { keywords: keywords.slice(0, 1000), location_code: 2840, language_code: "en" },
  ]);
  const rows = json?.tasks?.[0]?.result ?? null;
  if (!rows) return null;
  return Object.fromEntries(rows.map((r) => [r.keyword, { volume: r.search_volume ?? 0, cpc: r.cpc ?? null, competition: r.competition ?? null }]));
}

// Live US Google SERP for one query — the real top competitors for that term.
// Returns [{ position, url, domain, title }] (organic only, top `limit`) or null.
export async function serpTop(query, { limit = 10 } = {}) {
  const json = await dfs("serp/google/organic/live/regular", [
    { keyword: query, location_code: 2840, language_code: "en", depth: 10 },
  ]);
  const items = json?.tasks?.[0]?.result?.[0]?.items ?? null;
  if (!items) return null;
  return items
    .filter((i) => i.type === "organic")
    .slice(0, limit)
    .map((i) => ({ position: i.rank_absolute, url: i.url, domain: i.domain, title: i.title }));
}
