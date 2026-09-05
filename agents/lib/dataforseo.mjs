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

export async function keywordSuggestions(seed, { limit = 50 } = {}) {
  const json = await dfs("dataforseo_labs/google/keyword_suggestions/live", [
    { keyword: seed, location_code: 2840, language_code: "en", limit, order_by: ["keyword_info.search_volume,desc"] },
  ]);
  const items = json?.tasks?.[0]?.result?.[0]?.items ?? null;
  if (!items) return null;
  return items.map((item) => ({
    keyword: item.keyword_data?.keyword ?? item.keyword ?? "",
    volume: item.keyword_data?.keyword_info?.search_volume ?? item.keyword_info?.search_volume ?? 0,
    cpc: item.keyword_data?.keyword_info?.cpc ?? item.keyword_info?.cpc ?? null,
    competition: item.keyword_data?.keyword_info?.competition ?? item.keyword_info?.competition ?? null,
    difficulty: item.keyword_data?.keyword_properties?.keyword_difficulty ?? item.keyword_properties?.keyword_difficulty ?? null,
    intent: item.keyword_data?.search_intent_info?.main_intent ?? item.search_intent_info?.main_intent ?? null,
    monthlySearches: item.keyword_data?.keyword_info?.monthly_searches ?? item.keyword_info?.monthly_searches ?? [],
  })).filter((item) => item.keyword);
}

export async function keywordOverview(keywords) {
  if (!keywords?.length) return [];
  const json = await dfs("dataforseo_labs/google/keyword_overview/live", [
    { keywords: keywords.slice(0, 700), location_code: 2840, language_code: "en", include_serp_info: true },
  ]);
  const items = json?.tasks?.[0]?.result?.[0]?.items ?? null;
  if (!items) return null;
  return items.map((item) => ({
    keyword: item.keyword_data?.keyword ?? item.keyword ?? "",
    volume: item.keyword_data?.keyword_info?.search_volume ?? item.keyword_info?.search_volume ?? 0,
    cpc: item.keyword_data?.keyword_info?.cpc ?? item.keyword_info?.cpc ?? null,
    competition: item.keyword_data?.keyword_info?.competition ?? item.keyword_info?.competition ?? null,
    difficulty: item.keyword_data?.keyword_properties?.keyword_difficulty ?? item.keyword_properties?.keyword_difficulty ?? null,
    intent: item.keyword_data?.search_intent_info?.main_intent ?? item.search_intent_info?.main_intent ?? null,
    monthlySearches: item.keyword_data?.keyword_info?.monthly_searches ?? item.keyword_info?.monthly_searches ?? [],
    serp: item.keyword_data?.serp_info ?? item.serp_info ?? null,
    backlinks: item.keyword_data?.avg_backlinks_info ?? item.avg_backlinks_info ?? null,
  })).filter((item) => item.keyword);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export async function googleShoppingProducts(keyword, { depth = 20, maxPolls = 12 } = {}) {
  const posted = await dfs("merchant/google/products/task_post", [
    { keyword, location_code: 2840, language_code: "en", depth: Math.min(depth, 40), priority: 1 },
  ]);
  const id = posted?.tasks?.[0]?.id;
  if (!id) return null;
  for (let poll = 0; poll < maxPolls; poll++) {
    await sleep(poll ? 3000 : 1500);
    const json = await dfs(`merchant/google/products/task_get/advanced/${id}`);
    const task = json?.tasks?.[0];
    if ([20100, 40601, 40602].includes(task?.status_code)) continue;
    const items = task?.result?.[0]?.items;
    if (!items) return task?.status_code === 20000 ? [] : null;
    return items.map((item) => ({
      rank: item.rank_absolute ?? item.rank_group ?? null, title: item.title ?? "",
      price: item.price?.current ?? item.price ?? null, currency: item.price?.currency ?? item.currency ?? null,
      seller: item.seller ?? item.source ?? null, domain: item.domain ?? null, url: item.url ?? null,
      rating: item.rating?.value ?? item.rating ?? null, reviews: item.rating?.votes_count ?? item.reviews_count ?? null,
      shipping: item.delivery_info ?? item.delivery ?? null, productId: item.product_id ?? null,
    }));
  }
  return null;
}

// Competitor espionage (operator directive 2026-08-10): every US keyword an ESTABLISHED
// competitor domain ranks top-20 for, with volume and the exact ranking URL. Two consumers:
// content (which collection/product/blog pages to create to capture demand they proved) and
// sourcing (keywords they monetize that map to products we don't carry = Scout's next-product
// signal). Spying to learn the map — not to fight them head-on.
// Returns [{ keyword, volume, position, url }] sorted by volume, or null.
export async function domainRankedKeywords(domain, { limit = 100 } = {}) {
  const json = await dfs("dataforseo_labs/google/ranked_keywords/live", [
    { target: domain, location_code: 2840, language_code: "en", limit, order_by: ["keyword_data.keyword_info.search_volume,desc"], filters: [["ranked_serp_element.serp_item.rank_absolute", "<=", 20]] },
  ]);
  const items = json?.tasks?.[0]?.result?.[0]?.items ?? null;
  if (!items) return null;
  return items.map((i) => ({
    keyword: i.keyword_data?.keyword ?? "",
    volume: i.keyword_data?.keyword_info?.search_volume ?? 0,
    position: i.ranked_serp_element?.serp_item?.rank_absolute ?? null,
    url: i.ranked_serp_element?.serp_item?.url ?? null,
  }));
}

// Highest-value pages for a domain, with DataForSEO's weekly organic visibility/traffic metrics.
export async function domainRelevantPages(domain, { limit = 50 } = {}) {
  const json = await dfs("dataforseo_labs/google/relevant_pages/live", [
    { target: domain, location_code: 2840, language_code: "en", limit, order_by: ["metrics.organic.etv,desc"] },
  ]);
  const items = json?.tasks?.[0]?.result?.[0]?.items ?? null;
  if (!items) return null;
  return items.map((item) => ({ url: item.page_address, metrics: item.metrics ?? {} }));
}

// Discover domains sharing the same SERPs as Autivara instead of relying exclusively on a
// hand-maintained panel. Large platforms are excluded so the output stays commercially useful.
export async function organicCompetitorDomains(domain, { limit = 25 } = {}) {
  const json = await dfs("dataforseo_labs/google/competitors_domain/live", [
    { target: domain, location_code: 2840, language_code: "en", limit, max_rank_group: 20, exclude_top_domains: true, order_by: ["metrics.organic.etv,desc"] },
  ]);
  const items = json?.tasks?.[0]?.result?.[0]?.items ?? null;
  if (!items) return null;
  return items.map((item) => ({
    domain: item.domain, intersections: item.intersections ?? 0, avgPosition: item.avg_position ?? null,
    metrics: item.full_domain_metrics ?? item.metrics ?? {}, competitorMetrics: item.competitor_metrics ?? {},
  }));
}

// Live US Google SERP for one query — the real top competitors for that term.
// Returns organic results including snippets; Alibaba discovery uses indexed snippets as a
// compliant fallback when the public listing itself presents an anti-bot challenge.
export async function serpTop(query, { limit = 10 } = {}) {
  const json = await dfs("serp/google/organic/live/regular", [
    { keyword: query, location_code: 2840, language_code: "en", depth: 10 },
  ]);
  const items = json?.tasks?.[0]?.result?.[0]?.items ?? null;
  if (!items) return null;
  return items
    .filter((i) => i.type === "organic")
    .slice(0, limit)
    .map((i) => ({ position: i.rank_absolute, url: i.url, domain: i.domain, title: i.title, description: i.description ?? null }));
}
