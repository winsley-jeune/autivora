/**
 * Maps Shopify product tags to a human-readable category label
 * for analytics (Meta, GA4, TikTok, Pinterest), JSON-LD, and PDP eyebrows.
 *
 * Catalog tags (from product-pipeline/catalog.json):
 *   car / car-diffusers, car-accessories, home / home-diffusers,
 *   commercial-industrial, business, fragrance-oil / fragrance-oils, office
 */

// Priority-ordered: first match wins.
const CATEGORY_RULES: Array<{ match: string[]; label: string }> = [
  { match: ['fragrance-oil', 'fragrance-oils', 'refill', 'scent'], label: 'Fragrance Oil' },
  { match: ['business'], label: 'For Business' },
  { match: ['car-accessories'], label: 'Car Accessory' },
  { match: ['commercial-industrial', 'commercial', 'industrial'], label: 'Commercial Diffuser' },
  { match: ['home-diffusers', 'home'], label: 'Home Diffuser' },
  { match: ['office'], label: 'Office Diffuser' },
  { match: ['car-diffusers', 'car', 'auto'], label: 'Car Diffuser' },
];

export function categoryFromTags(tags?: string[]): string {
  if (!tags || tags.length === 0) return 'Diffuser';
  const lower = tags.map((t) => t.toLowerCase());
  const rule = CATEGORY_RULES.find((r) => r.match.some((m) => lower.includes(m)));
  return rule ? rule.label : 'Diffuser';
}

// True only for car-segment products (used to gate car-only UI like vehicle fitment).
export function isCarProduct(tags?: string[]): boolean {
  if (!tags) return false;
  const lower = tags.map((t) => t.toLowerCase());
  return ['car', 'car-diffusers', 'car-accessories', 'auto'].some((m) => lower.includes(m));
}

// True for refill fragrance oils (used to gate device-only language).
export function isOil(tags?: string[]): boolean {
  if (!tags) return false;
  const lower = tags.map((t) => t.toLowerCase());
  return ['fragrance-oil', 'fragrance-oils'].some((m) => lower.includes(m));
}
