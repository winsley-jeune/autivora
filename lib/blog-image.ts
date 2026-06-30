// Picks a real product image for a blog post based on its topic, so every
// article has a relevant hero/thumbnail. Images are served from /public/products.
const CAR = '/products/autivora-astronaut-car-diffuser/autivora-astronaut-car-diffuser-1.jpg';
const HOME = '/products/autivora-volcano-flame-diffuser/autivora-volcano-flame-diffuser-1.jpg';
const COMMERCIAL = '/products/autivora-atmos-pro-hvac/autivora-atmos-pro-hvac-1.jpg';

// Slug-level overrides where keyword matching would misfire (e.g. a "smell like
// a hotel" article is a HOME topic, not commercial).
const IMAGE_OVERRIDES: Record<string, string> = {
  'how-to-make-your-house-smell-like-a-hotel': HOME,
};

export function blogImage(a: { slug: string; title: string; category?: string }): string {
  if (IMAGE_OVERRIDES[a.slug]) return IMAGE_OVERRIDES[a.slug];
  const t = `${a.slug} ${a.title} ${a.category ?? ''}`.toLowerCase();
  if (/\bcar\b|vehicle|tesla|\bev\b|drift|pura car|vent|dealership|detailer|driving/.test(t)) return CAR;
  if (/hotel|gym|spa|salon|dental|restaurant|\bbar\b|retail|boutique|business|aroma360|airbnb|staging|commercial|office|hvac/.test(t)) return COMMERCIAL;
  return HOME; // home / room / whole-house / oil / pets / general
}
