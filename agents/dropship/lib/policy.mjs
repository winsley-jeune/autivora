// Sourcing policy — every economics rule learned during the 2026-07-29/30 manual sourcing
// sessions, encoded once so the agent never has to rediscover them (and the operator never has
// to re-explain them in chat). Scout reasons WITHIN these constraints; it does not set prices.
//
// Two tiers, deliberately different economics:
//
//  us-fast     US-warehouse stock, 2-6 day delivery, free shipping. Small pool (~dozens of real
//              candidates platform-wide), higher COGS ($40-450), thin per-SKU stock (often 1-20
//              units). Premium/considered-purchase tier.
//
//  value-china China-origin, 7-15 day delivery, ~$2 shipping. The classic dropship model: huge
//              pool (17k-40k results per keyword), cheap COGS ($1-10), deep stock, heavy social
//              proof (products with 3k-17k reviews are common). Impulse-buy tier — the margin
//              multiple must fund paid acquisition (TikTok/Amazon ads), which is why it's high.
//
// Verification doctrine (non-negotiable, each rule traces to a real failure):
//  - Search results lie. A listing matching ship_from=US or showing stock numbers means nothing;
//    only aliexpress.ds.freight.query against a real address is truth. (Dozens of "1000 stock"
//    listings failed freight across LA/NY/Houston/Miami.)
//  - Pick the BEST-STOCKED matching SKU variant, never the first match — .find() on the first
//    "Ships From: US" variant produced false zero-stock readings and cost a whole sourcing round.
//  - NGSELECTION_SEARCH_ERROR is transient (same query flips between working and erroring
//    minutes apart) — retry it; never record it as "zero results".

export const TIERS = {
  "us-fast": {
    shipFromUSVariantPreferred: true,
    searchShipFromFilter: "US",
    // Module-1 (autivara.com) economics, operator directive 2026-07-30: delivery time is
    // FLEXIBLE (strict 2-5d fulfillment belongs to the future Amazon module, not here); what's
    // non-negotiable is profit — target 7-10x on landed cost, floor 7x. Scout still judges the
    // exact multiple per product (and may exceed 10x when perceived value supports it), but
    // nothing imports below 7x-viable.
    maxDeliveryDays: 20,
    maxLandedCost: 500,
    minMultiple: 7,
    // The real US pool is thin; hard trust gates would empty it. Low-trust items import anyway
    // but MUST carry a visible review-risk note (Scout's copy rules enforce this).
    minTrust: { minRating: 0, minReviews: 0 },
    importCapPerRun: 3,
  },
  "value-china": {
    shipFromUSVariantPreferred: false,
    searchShipFromFilter: null,
    // Flexible delivery per Module-1 directive; 30d is a sanity cap, not a target. Profit floor
    // 7x with a 7-10x working target; Scout may go far higher (20x/50x — "$2 item priced at
    // $40" remains a real reference point) when perceived value and competitive gap support it.
    maxDeliveryDays: 30,
    maxLandedCost: 12,
    minMultiple: 7,
    // Quality bar without selecting FOR saturation: the old 500-review floor guaranteed every
    // candidate was already an Amazon-saturated commodity (anchor-test failure by construction).
    // Emerging anchor-free items have modest review counts with strong ratings.
    minTrust: { minRating: 4.3, minReviews: 50, orAlternative: { minOrders: 1000 } },
    importCapPerRun: 5,
  },
};

// Title-level noise for the scent-diffuser niche. "Diffuser" collides hard with automotive
// body-kit parts and raw oil bottles; both dominated early sweeps until filtered.
export const NOISE_PATTERNS = [
  /bumper|spoiler|body kit|splitter|shark fin|carbon fiber|\bwing\b|\blip\b|steering wheel|trunk\b|jdm|racing car|rear diffuser|front diffuser/i, // auto body kits
  /hair ?dryer|hairdressing|curly hair|salon/i, // hair-dryer diffuser attachments
  /photography|umbrella|studio|flash/i, // light diffusers
  // Raw oil bottles (kept out of the DEVICE tiers; oils-as-products is a separate, unresolved
  // strategy question — every US-warehoused oil candidate failed live stock checks anyway).
  /essential oils? for|oils? for humidifier|pure natural essential|10ml roller|roller ball|dropper bottle|empty.*bottle|for candles|for soap|handmade diy soap|massage oil/i,
];

export function isNoise(title) {
  return NOISE_PATTERNS.some((re) => re.test(title));
}

export function passesTrust(tier, { rating, reviews, orders }) {
  const t = TIERS[tier].minTrust;
  const base = (rating ?? 0) >= t.minRating && (reviews ?? 0) >= t.minReviews;
  const alt = t.orAlternative ? (orders ?? 0) >= t.orAlternative.minOrders : false;
  return base || alt;
}

// Scout proposes the multiple (its merchandising judgment); policy clamps it to the tier floor
// so no import can ever be priced below CAC-fundable territory, then formats the price.
export function computePrice(landedCost, tier, proposedMultiple) {
  const multiple = Math.max(TIERS[tier].minMultiple, Number(proposedMultiple) || 0);
  return { price: (Math.round(landedCost * multiple) - 0.01).toFixed(2), multiple };
}

// STRICT 7x LAW (operator, 2026-08-01 — REVOKES the same-day exception lane after one day and
// four sub-floor imports, all since retired): every import must hold >=7x landed AND sit
// at-or-under the prevailing US market price, simultaneously. Corollary: the only viable hunt
// rule is maxLanded = USMarketPrice / 7 per category, computed BEFORE searching. No sub-floor
// proposals, no exceptions.

// Per-run work caps: keep the daily run bounded (API quota, runtime) and the import stream
// reviewable by a human — a firehose of drafts is as useless as none.
export const SCAN_KEYWORDS_PER_TIER = 5;
export const VERIFY_CAP_PER_RUN = 12;
export const REJECT_COOLDOWN_DAYS = 30; // don't re-verify a known-dead candidate for a month
