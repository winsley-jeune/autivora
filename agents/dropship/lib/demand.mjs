// Demand-side discovery — the observation layer of Scout's demand-first pipeline.
//
// Design (operator decision 2026-08-06): discovery was inverted. The old loop typed keywords
// into AliExpress search and asked the model to imagine demand for whatever came back — but
// AliExpress search surfaces its most-ordered items by construction, which is precisely the
// saturated/anchored inventory the CEO gate must reject. Six consecutive empty runs were the
// structural result, not bad luck.
//
// The corrected sequence: OBSERVE demand that already happened → form a hypothesis with cited
// evidence → reverse-source supply for it. This module owns the deterministic observation
// inputs (our own search + sales data) and the hypothesis lifecycle in catalog state. The
// live-market observation (web search) happens in the demand-research model call (see
// prompt-demand.md); this module prepares its inputs and applies its outputs.
//
// Hypothesis record shape (catalog.demandHypotheses):
//   { id, hypothesis, evidence, usAnchorPrice, anchor: "strong"|"weak",
//     keywords: [..], tier, collection, status: "active"|"retired",
//     createdOn, yields: { scans, candidates, imports }, retiredOn?, retireReason? }

// Keep this many hypotheses in play; the research call runs only when we're below it, so the
// (expensive, multi-minute) web-search pass is a topping-up cost, not a per-run cost.
export const HYPOTHESIS_TARGET = 4;

// A hypothesis that has been scanned this many times without producing a single verified
// candidate is spent regardless of how good the story was — surfaced to the researcher for
// explicit retirement rather than auto-killed, so the reason lands in state.
export const HYPOTHESIS_STALE_SCANS = 3;

const BRAND_RE = /autivara|autivora/i;

// Our own Search Console data is observed demand — real people typed these queries and Google
// showed us for them. Returns the top non-brand queries with the page that currently serves
// each, so the researcher can distinguish "demand we already capture" from "demand we see but
// have no answer for" (the gaps worth sourcing/merchandising toward).
export function mineSearchDemand(snapshot, { minImpressions = 5, limit = 15 } = {}) {
  const sc = snapshot?.searchConsole;
  if (!sc?.queries?.length) return { note: "no search console data in snapshot", queries: [] };

  const servedBy = new Map(); // query -> {page, impressions}
  for (const row of sc.pageQueries ?? []) {
    const [page, query] = row.keys;
    const cur = servedBy.get(query);
    if (!cur || row.impressions > cur.impressions) {
      servedBy.set(query, { page: page.replace(/^https?:\/\/[^/]+/, ""), impressions: row.impressions });
    }
  }

  const queries = sc.queries
    .filter((r) => !BRAND_RE.test(r.keys[0]) && r.impressions >= minImpressions)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, limit)
    .map((r) => ({
      query: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      position: Math.round(r.position * 10) / 10,
      served_by: servedBy.get(r.keys[0])?.page ?? null,
    }));

  return { window_days: sc.windowDays, data_through: sc.dataThrough ?? null, queries };
}

// Real orders are the strongest demand signal we own. n is tiny — the contract with consumers
// of this data is honesty about that: a proven_sale is a LEAD to exploit cheaply (variants,
// bundle attach, distribution priority), never a validated winner.
export function provenSales(snapshot) {
  const sh = snapshot?.shopify;
  if (!sh) return { note: "no shopify data in snapshot", products: [] };
  return {
    window_days: sh.windowDays,
    total_orders: sh.orderCount ?? 0,
    total_revenue: sh.revenue ?? 0,
    products: sh.topProducts ?? [],
    note: "Observed sales, test orders excluded. Any SKU here is a LEAD: exploit it cheaply (scent variants, refill/bundle attach, distribution priority) before hunting new hypotheses. It is NOT a validated winner — see winner_definition.",
  };
}

// The winner metric, stated once so every agent reasons against the same bar instead of
// feelings. Detection is trivial given the inputs; the point is having it written down.
export const WINNER_DEFINITION =
  "A winner = 5+ orders in 30 days at >=3x margin after landed cost, from a nameable channel we can scale. One sale is an anecdote; a winner is repeatable. No current SKU qualifies.";

export function activeHypotheses(catalog) {
  return (catalog.demandHypotheses ?? []).filter((h) => h.status === "active");
}

// Hypotheses the researcher should explicitly confirm or retire: scanned repeatedly, nothing
// verified. Passed to the research call as candidates for retirement.
export function staleHypotheses(catalog) {
  return activeHypotheses(catalog).filter(
    (h) => (h.yields?.scans ?? 0) >= HYPOTHESIS_STALE_SCANS && (h.yields?.candidates ?? 0) === 0,
  );
}

// Fold a research call's output into catalog state. Returns the new hypothesis records so the
// caller can scan them in the same run (fresh hypotheses are the highest-information scans).
export function applyResearchOutput(catalog, output, todayStr) {
  const added = [];
  const existing = catalog.demandHypotheses ?? (catalog.demandHypotheses = []);

  for (const id of output.retire_hypothesis_ids ?? []) {
    const h = existing.find((x) => x.id === id && x.status === "active");
    if (h) {
      h.status = "retired";
      h.retiredOn = todayStr;
      h.retireReason = "researcher retired (see research_note of that run)";
    }
  }

  let seq = existing.length;
  for (const nh of output.hypotheses ?? []) {
    added.push({
      id: `dh-${todayStr}-${++seq}`,
      hypothesis: nh.hypothesis,
      evidence: nh.demand_evidence,
      usAnchorPrice: nh.us_anchor_price,
      anchor: nh.anchor,
      keywords: nh.aliexpress_keywords ?? [],
      tier: nh.tier,
      collection: nh.collection,
      status: "active",
      createdOn: todayStr,
      yields: { scans: 0, candidates: 0, imports: 0 },
    });
  }
  existing.push(...added);
  return added;
}
