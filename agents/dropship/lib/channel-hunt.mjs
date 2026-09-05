const round = (value) => Math.round(Number(value) * 100) / 100;
const positive = (value) => Number.isFinite(Number(value)) && Number(value) >= 0;

export const AMAZON_MONTHLY_UNIT_TARGET = 10_000;
export const MINIMUM_NET_MARGIN_RATE = 0.30;
export const AMAZON_COST_RESERVE_RATE = 0.50;

export function amazonHuntEconomics(input) {
  const price = Number(input.sellingPrice);
  const landed = Number(input.landedCost);
  const referralRate = Number(input.referralFeeRate);
  const fbaFee = Number(input.fbaFee);
  const storage = Number(input.storagePerUnit ?? 0);
  const cpc = Number(input.ppcCpc);
  const conversionRate = Number(input.ppcConversionRate);
  const ppcPerOrder = cpc > 0 && conversionRate > 0 ? cpc / conversionRate : null;
  const complete = price > 0 && landed > 0 && positive(referralRate) && positive(fbaFee)
    && positive(storage) && ppcPerOrder != null;
  if (!complete) return { complete: false, blockers: ['complete_amazon_fees_dimensions_and_ppc_required'] };
  const modeledAmazonCost = price * referralRate + fbaFee + storage + ppcPerOrder;
  const amazonCostReserve = price * AMAZON_COST_RESERVE_RATE;
  const channelCost = Math.max(modeledAmazonCost, amazonCostReserve);
  const contributionProfit = price - landed - channelCost;
  const netMarginRate = contributionProfit / price;
  const blockers = [];
  if (!input.privateLabelPossible) blockers.push('private_label_required');
  if (Number(input.monthlyUnitPotential ?? 0) < AMAZON_MONTHLY_UNIT_TARGET) blockers.push('monthly_10k_unit_potential_not_proven');
  if (netMarginRate < MINIMUM_NET_MARGIN_RATE) blockers.push('net_margin_below_30pct_after_amazon_and_ppc');
  return {
    complete: true, eligible: blockers.length === 0, blockers,
    sellingPrice: round(price), landedCost: round(landed), modeledAmazonCost: round(modeledAmazonCost),
    amazonCostReserve: round(amazonCostReserve), channelCost: round(channelCost),
    ppcPerOrder: round(ppcPerOrder), contributionProfit: round(contributionProfit),
    netMarginRate: round(netMarginRate), monthlyUnitPotential: Number(input.monthlyUnitPotential ?? 0),
  };
}

export function autivaraHuntEconomics(input) {
  const price = Number(input.sellingPrice);
  const landed = Number(input.landedCost);
  const fulfillment = Number(input.fulfillmentPerUnit);
  const paymentRate = Number(input.paymentFeeRate ?? 0.03);
  const blendedCac = Number(input.blendedCac);
  const complete = price > 0 && landed > 0 && positive(fulfillment) && positive(paymentRate) && positive(blendedCac);
  if (!complete) return { complete: false, blockers: ['complete_landed_fulfillment_and_acquisition_cost_required'] };
  const contributionProfit = price - landed - fulfillment - price * paymentRate - blendedCac;
  const netMarginRate = contributionProfit / price;
  const blockers = [];
  if (!input.privateLabelPossible) blockers.push('private_label_required');
  if (!input.organicDemandEvidence && !input.paidAcquisitionEvidence) blockers.push('acquisition_path_not_proven');
  if (netMarginRate < MINIMUM_NET_MARGIN_RATE) blockers.push('net_margin_below_30pct_after_acquisition');
  return {
    complete: true, eligible: blockers.length === 0, blockers,
    sellingPrice: round(price), landedCost: round(landed), fulfillmentPerUnit: round(fulfillment),
    paymentCost: round(price * paymentRate), blendedCac: round(blendedCac),
    contributionProfit: round(contributionProfit), netMarginRate: round(netMarginRate),
  };
}
