const money = (value) => Number(String(value).replaceAll(',', ''));
const finite = (value) => Number.isFinite(value) ? value : null;
const round = (value) => Math.round(value * 100) / 100;

export function parseAlibabaEvidence(text, source = 'listing') {
  const raw = String(text ?? '').replaceAll('&quot;', '"').replaceAll('&#34;', '"');
  if (/punish-component|captcha intercept|unusual traffic|_____tmd_____/i.test(raw)) {
    return { source, blocked: true, priceLow: null, priceHigh: null, moq: null };
  }
  const compact = raw.replace(/<[^>]+>/g, ' ').replace(/\\u0024/g, '$').replace(/\s+/g, ' ');
  const range = compact.match(/(?:US\s*)?\$\s*([\d,.]+)\s*(?:-|–|to)\s*(?:US\s*)?\$?\s*([\d,.]+)/i);
  const jsonLow = compact.match(/"(?:minPrice|lowPrice|min_price)"\s*:\s*"?([\d,.]+)/i);
  const jsonHigh = compact.match(/"(?:maxPrice|highPrice|max_price)"\s*:\s*"?([\d,.]+)/i);
  const single = compact.match(/(?:US\s*)?\$\s*([\d,.]+)/i);
  const priceLow = finite(money(range?.[1] ?? jsonLow?.[1] ?? single?.[1]));
  const priceHigh = finite(money(range?.[2] ?? jsonHigh?.[1] ?? priceLow));
  const moqMatch = compact.match(/(?:MOQ|Min(?:imum)?\.?\s*Order(?:\s*Quantity)?)\s*:?\s*(\d[\d,]*)/i)
    ?? compact.match(/(\d[\d,]*)\s*(?:pieces?|sets?|units?)\s*\(\s*Min\.?\s*Order\s*\)/i)
    ?? compact.match(/"(?:minOrderQuantity|minimumOrderQuantity|moq)"\s*:\s*"?(\d[\d,]*)/i);
  const moq = finite(money(moqMatch?.[1]));
  return {
    source, blocked: false, priceLow, priceHigh, moq,
    tradeAssuranceAdvertised: /trade assurance/i.test(compact),
    verifiedSupplierAdvertised: /verified supplier/i.test(compact),
  };
}

export function estimateAlibabaEconomics(evidence, marketplacePrices = []) {
  if (!(evidence?.priceHigh > 0) || !(evidence?.moq > 0)) return null;
  const unitCostLow = evidence.priceLow > 0 ? evidence.priceLow : evidence.priceHigh;
  const unitCostHigh = evidence.priceHigh;
  // Until weight/dimensions and destination quotes exist, use an explicit conservative range.
  // These are screening assumptions, never the final launch economics.
  const landedLow = round(unitCostLow + Math.max(6, unitCostLow * 0.25) + unitCostLow * 0.08 + 2.5);
  const landedHigh = round(unitCostHigh + Math.max(10, unitCostHigh * 0.5) + unitCostHigh * 0.2 + 3.5);
  const prices = marketplacePrices.map(Number).filter((x) => Number.isFinite(x) && x > 0).sort((a, b) => a - b);
  const marketMedian = prices.length ? prices[Math.floor(prices.length / 2)] : null;
  const targetRetail = marketMedian == null ? null : round(marketMedian);
  const contributionMarginLow = targetRetail == null ? null : round((targetRetail - landedHigh - targetRetail * 0.03) / targetRetail);
  const contributionMarginHigh = targetRetail == null ? null : round((targetRetail - landedLow - targetRetail * 0.03) / targetRetail);
  return { unitCostLow, unitCostHigh, landedLow, landedHigh, marketMedian, targetRetail, contributionMarginLow, contributionMarginHigh, estimateOnly: true };
}

export function prequalifyAlibaba({ evidence, economics, demand }) {
  if (evidence?.blocked && !(evidence.priceHigh > 0)) return { status: 'listing_data_blocked', score: 0, blockers: ['price_and_moq_not_publicly_accessible'] };
  const blockers = [];
  if (!(evidence?.priceHigh > 0)) blockers.push('advertised_price_missing');
  if (!(evidence?.moq > 0)) blockers.push('advertised_moq_missing');
  if (evidence?.moq > 50) blockers.push('discovery_moq_above_50');
  if (!economics?.marketMedian) blockers.push('marketplace_price_missing');
  if (economics?.contributionMarginLow != null && economics.contributionMarginLow < 0.3) blockers.push('estimated_margin_below_30pct');
  if (!demand || demand.volume <= 0) blockers.push('measured_search_demand_missing');
  const fatal = blockers.some((x) => ['discovery_moq_above_50', 'estimated_margin_below_30pct'].includes(x));
  const complete = blockers.length === 0;
  const score = complete ? Math.round(Math.min(100,
    Math.log10(1 + demand.volume) * 18
    + Math.min(20, Number(demand.cpc ?? 0) * 4)
    + Math.max(0, economics.contributionMarginLow * 35)
    + Math.max(0, 15 - evidence.moq / 4))) : 0;
  return { status: fatal ? 'reject_preliminary' : complete ? 'prequalified' : 'needs_evidence', score, blockers };
}
