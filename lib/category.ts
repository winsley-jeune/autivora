/**
 * Maps Shopify product tags to a human-readable category label
 * for analytics (Meta, GA4, TikTok, Pinterest) and JSON-LD.
 *
 * Tag your products in Shopify admin with one of: auto, home, office, industrial, scent.
 */

const CATEGORY_LABELS: Record<string, string> = {
  auto: 'Auto Diffuser',
  home: 'Home Diffuser',
  office: 'Office Diffuser',
  industrial: 'Industrial Diffuser',
  scent: 'Scent / Refill Oil',
};

export function categoryFromTags(tags?: string[]): string {
  if (!tags || tags.length === 0) return 'Diffuser';
  const lower = tags.map((t) => t.toLowerCase());
  const match = Object.keys(CATEGORY_LABELS).find((key) => lower.includes(key));
  return match ? CATEGORY_LABELS[match] : 'Diffuser';
}
