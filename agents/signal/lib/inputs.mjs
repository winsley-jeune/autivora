// Assembles the 10 inputs Signal's prompt expects, from the analytics agent's snapshot plus
// Signal's own task store / query history / link-graph crawl. Read-only.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { expectedCtr } from "./ctr-benchmark.mjs";
import { computeNewQueries, loadQueryHistory } from "./query-history.mjs";
import { getLinkGraph } from "./link-graph.mjs";
import { loadTasks, openTasks, checkbacksDue, outcomeHistory, meanByAction } from "./task-store.mjs";
import { getMetricSeries } from "./snapshot-history.mjs";
import { loadCatalog } from "../../dropship/lib/catalog-store.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ANALYTICS_OUT = join(__dir, "..", "..", "analytics", "output");
// Real query-level impressions at this stage top out in the tens, not hundreds — the original
// 50-impression trigger meant ctr_candidates was permanently empty. Rescaled to actual volume.
const CTR_IMPRESSION_MIN = 20;
// Below this many site-wide organic impressions/28d, per-query CTR deltas aren't statistically
// readable at all (a "CTR >= 3% in 14 days" target on a 30-impression query is noise) — the
// binding constraint at that volume is authority/indexation/position, not snippet click-through.
// Gates the whole CTR lane rather than just filtering individual candidates.
const CTR_STAGE_MIN_TOTAL_IMPRESSIONS = 1500;
const UPLIFT_POSITION_MIN = 8;
const UPLIFT_POSITION_MAX = 20;
const INDEX_COVERAGE_STALE_DAYS = 7;

// Brand/domain queries ("autivara.com", "autivara", typo variants) rank #1 trivially and are
// mostly rank-tracker or bot traffic, not real demand — excluded from every candidate lane and
// from the totals Signal reasons from, not just the author gate.
const BRAND_QUERY = /autivara|autivora|aitvara|alto vara/i;
const isOrganicRow = (r) => !BRAND_QUERY.test(r.keys[1]);

function readJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function ctrCandidates(pageQueries) {
  return pageQueries
    .filter(isOrganicRow)
    .filter((r) => r.impressions >= CTR_IMPRESSION_MIN)
    .map((r) => {
      const expected = expectedCtr(r.position);
      return {
        target_url: new URL(r.keys[0]).pathname,
        target_query: r.keys[1],
        impressions: r.impressions,
        clicks: r.clicks,
        ctr: Number(r.ctr.toFixed(4)),
        avg_position: Number(r.position.toFixed(1)),
        expected_ctr: Number(expected.toFixed(4)),
        opportunity: Number((r.impressions * Math.max(0, expected - r.ctr)).toFixed(2)),
      };
    })
    .filter((r) => r.ctr < r.expected_ctr)
    .sort((a, b) => b.opportunity - a.opportunity)
    .slice(0, 20);
}

function upliftCandidates(pageQueries) {
  return pageQueries
    .filter(isOrganicRow)
    .filter((r) => r.position >= UPLIFT_POSITION_MIN && r.position <= UPLIFT_POSITION_MAX)
    .map((r) => ({
      target_url: new URL(r.keys[0]).pathname,
      target_query: r.keys[1],
      impressions: r.impressions,
      clicks: r.clicks,
      avg_position: Number(r.position.toFixed(1)),
    }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15);
}

function salesEvents(shopify) {
  if (!shopify) return { note: "Shopify snapshot unavailable — run npm run analytics:shopify first.", byDay: [], topProducts: [] };
  return {
    note: "No landing-page attribution yet — GA4 byLandingPage and Shopify orders aren't joined. Treat as store-wide signal, not per-page.",
    windowDays: shopify.windowDays,
    orderCount: shopify.orderCount,
    revenue: shopify.revenue,
    byDay: shopify.byDay,
    topProducts: shopify.topProducts,
  };
}

// The link-graph crawl (orphaned pages) and the index-coverage audit (unindexed pages) are two
// separate signals that never meet on their own — their intersection (orphaned AND unindexed)
// is the highest-priority linker target list available: pages Google hasn't indexed, that also
// have zero inbound links from the already-indexed, impression-earning pages that could fix it.
function unindexedPages() {
  const coverage = readJson(join(ANALYTICS_OUT, "index-coverage-latest.json"));
  if (!coverage) return { note: "No index-coverage audit found — run `npm run analytics:index`.", pages: [] };

  const staleness = coverage.generatedAt
    ? (Date.now() - new Date(coverage.generatedAt).getTime()) / (24 * 60 * 60 * 1000)
    : null;
  const stale = staleness === null || staleness > INDEX_COVERAGE_STALE_DAYS;

  return {
    note: stale
      ? `Stale — this audit is ${staleness === null ? "of unknown age (no generatedAt)" : `${Math.round(staleness)} days old`}; not part of the daily snapshot (it's slow), re-run \`npm run analytics:index\` before trusting it heavily.`
      : `${Math.round(staleness)} days old.`,
    generatedAt: coverage.generatedAt ?? null,
    pages: coverage.notIndexed.map((p) => ({ url: new URL(p.url).pathname, coverageState: p.coverageState })),
  };
}

export async function buildInputs({ baseUrl, skipCrawl = false } = {}) {
  const snapshot = readJson(join(ANALYTICS_OUT, "snapshot-latest.json"));
  if (!snapshot) {
    throw new Error("No analytics snapshot found. Run `npm run analytics:run` first.");
  }
  const { searchConsole, ga4, shopify } = snapshot;
  const pageQueries = searchConsole.pageQueries || [];

  const queryHistory = loadQueryHistory();
  const newQueries = computeNewQueries(searchConsole.queries, queryHistory);

  const linkGraph = skipCrawl
    ? { crawledAt: null, totalBlogPages: 0, orphaned: [], noProductLink: [], skipped: true }
    : await getLinkGraph(baseUrl);

  const store = loadTasks();
  const history = outcomeHistory(store);

  // Enrich each due checkback with its real day-by-day metric trail (from dated snapshot
  // history) rather than leaving Signal to compare a single frozen `evidence` value against
  // whatever `snapshot-latest` happens to be today — see agents/signal/lib/snapshot-history.mjs.
  const dueTasks = checkbacksDue(store).map((t) => ({
    ...t,
    metric_series: t.target_query
      ? getMetricSeries(t.target_url, t.target_query, t.created_at.slice(0, 10))
      : null,
  }));

  const totalImpressions = searchConsole.queries.reduce((s, q) => s + q.impressions, 0);
  const totalClicks = searchConsole.queries.reduce((s, q) => s + q.clicks, 0);
  const organicRows = pageQueries.filter(isOrganicRow);
  const organicImpressions = organicRows.reduce((s, r) => s + r.impressions, 0);
  const organicClicks = organicRows.reduce((s, r) => s + r.clicks, 0);
  // Distinct non-branded queries holding page one — the author gate is about proven organic
  // reach, not brand-name/domain lookups (which rank #1 trivially and prove nothing).
  const pageOneQueries = new Set(organicRows.filter((r) => r.position <= 10).map((r) => r.keys[1]));

  const strategicState = {
    window_days: searchConsole.windowDays,
    // Freshest date Google returned Search Console data for. GSC finalizes with a 2-3 day
    // lag; rows past the finalized window are partial and may revise upward — treat this,
    // not "yesterday", as the search-data horizon when reasoning about recent movement.
    search_data_through: searchConsole.dataThrough ?? null,
    search_console_impressions: totalImpressions,
    search_console_clicks: totalClicks,
    search_console_ctr: totalImpressions ? Number((totalClicks / totalImpressions).toFixed(4)) : 0,
    // Same totals, minus brand/domain queries — this is the number that actually reflects
    // demand, and what ctr_lane_active is gated on.
    organic_impressions: organicImpressions,
    organic_clicks: organicClicks,
    ga4_sessions_28d: (ga4.byChannel || []).reduce((s, c) => s + c.sessions, 0),
    shopify_orders: shopify?.orderCount ?? 0,
    shopify_revenue: shopify?.revenue ?? 0,
    page_one_query_count: pageOneQueries.size,
    author_gate_met: pageOneQueries.size >= 10,
    // Below CTR_STAGE_MIN_TOTAL_IMPRESSIONS, per-query CTR deltas are noise — defer the whole
    // lane rather than let Signal chase unmeasurable thresholds. See prompt.md's priority order.
    ctr_lane_active: organicImpressions >= CTR_STAGE_MIN_TOTAL_IMPRESSIONS,
    standing_priority_order: ["ctr", "uplift", "linker", "envoy", "author", "social"],
  };

  return {
    strategic_state: strategicState,
    ctr_candidates: ctrCandidates(pageQueries),
    uplift_candidates: upliftCandidates(pageQueries),
    new_queries: newQueries.slice(0, 25),
    link_graph_gaps: linkGraph,
    unindexed_pages: unindexedPages(),
    open_tasks: openTasks(store),
    checkbacks_due: dueTasks,
    outcome_history: { recent: history, mean_by_action: meanByAction(history) },
    sales_events: {
      ...salesEvents(shopify),
      // Revenue attribution (added 2026-08-01): GA4 purchases joined to landing pages. An empty
      // array is a real "no attributed purchases yet"; a string note means the snapshot predates
      // the attribution lane — rerun analytics.
      ga4_purchases_by_landing_page:
        ga4.purchasesByLandingPage ?? "not in this snapshot yet — analytics:run predates the attribution lane",
    },
    product_economics: productEconomics(),
    pricing_experiments: readJson(join(__dir, "..", "state", "pricing-experiments.json")) ?? [],
    sourcing_state: sourcingState(),
    _store: store,
    _searchConsoleQueries: searchConsole.queries,
  };
}

// Scout's side of the funnel (added 2026-08-09, operator directive): Signal's constraint
// analysis must account for sourcing reality — what the catalog actually holds, which demand
// hypotheses died and why, and what Scout concluded on its last run. Without this, Signal
// reasons about GSC/GA4/Shopify while blind to whether the product side can even respond
// (e.g. 9 zero-import runs proved the artisan-wood vein unsourceable while Signal kept
// optimizing pages for it). Read-only from the shared catalog store + Scout's latest digest.
function sourcingState() {
  try {
    const cat = loadCatalog();
    const scout = readJson(join(__dir, "..", "..", "dropship", "output", "scout-latest.json"));
    const byStatus = {};
    for (const p of cat.products) {
      const k = `${p.tier}/${p.status}`;
      byStatus[k] = (byStatus[k] ?? 0) + 1;
    }
    return {
      note: "Scout's sourcing reality. Weigh this in your binding-constraint call — do not emit tasks that assume products the pipeline has proven it cannot source. You may steer Scout via the optional sourcing_guidance output field.",
      catalog_counts: byStatus,
      active_hypotheses: cat.demandHypotheses.filter((h) => h.status === "active").map(({ id, hypothesis, tier, yields }) => ({ id, hypothesis, tier, yields })),
      retired_hypotheses: cat.demandHypotheses.filter((h) => h.status === "retired").map(({ id, retiredOn, retiredReason }) => ({ id, retiredOn, retiredReason })),
      recent_scout_lessons: cat.lessons.slice(-3),
      last_scout_run: scout ? { date: scout.date, imported: scout.imported?.length ?? 0, lesson: scout.lesson, daily_note: scout.daily_note } : null,
    };
  } catch (e) {
    return { note: `sourcing state unavailable: ${e.message.slice(0, 120)}` };
  }
}

// Contribution-weighted prioritization (2026-08-01): under the store's 7x-landed pricing law,
// contribution per sale ≈ ~85% of price, so price is a faithful margin proxy — Signal weights
// tasks by dollars, not just traffic opportunity.
function productEconomics() {
  const cat = readJson(join(__dir, "..", "..", "..", "product-pipeline", "catalog-novelty.json"));
  if (!cat) return { note: "catalog not found", products: [] };
  return {
    note: "Contribution per sale ≈ price (7x-landed pricing law). Weight product/commercial-page tasks by this, not just traffic.",
    products: cat.products.map((p) => ({ url: `/product/${p.handle}`, title: p.title, price: p.price, collection: p.collection })),
  };
}
