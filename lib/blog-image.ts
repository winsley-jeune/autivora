// Picks a hero image for a blog post. Checks for a per-slug generated image first (real product,
// recontextualized for that specific article — see agents/content/generate-blog-image.mjs) before
// falling back to one of 3 shared generic product photos. As more per-slug images get generated,
// this needs no further edits — just drop the file at public/blog/<slug>.jpg.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const CAR = '/products/autivora-astronaut-car-diffuser/autivora-astronaut-car-diffuser-1.jpg';
const HOME = '/products/autivora-volcano-flame-diffuser/autivora-volcano-flame-diffuser-1.jpg';
const COMMERCIAL = '/products/autivora-atmos-pro-hvac/autivora-atmos-pro-hvac-1.jpg';

// Slug-level overrides where keyword matching would misfire (e.g. a "smell like
// a hotel" article is a HOME topic, not commercial).
const IMAGE_OVERRIDES: Record<string, string> = {
  'how-to-make-your-house-smell-like-a-hotel': HOME,
  'how-to-make-your-home-smell-like-a-spa': HOME,
  'why-do-boutiques-and-stores-smell-so-good': HOME,
  // B2B pieces → commercial hero where keyword matching would misroute to home.
  'what-is-scent-marketing': COMMERCIAL,
  'how-to-make-your-coffee-shop-smell-good': COMMERCIAL,
};

function hasGeneratedImage(slug: string): boolean {
  return existsSync(join(process.cwd(), 'public', 'blog', `${slug}.jpg`));
}

export function blogImage(a: { slug: string; title: string; category?: string }): string {
  if (hasGeneratedImage(a.slug)) return `/blog/${a.slug}.jpg`;
  if (IMAGE_OVERRIDES[a.slug]) return IMAGE_OVERRIDES[a.slug];
  const t = `${a.slug} ${a.title} ${a.category ?? ''}`.toLowerCase();
  if (/\bcar\b|vehicle|tesla|\bev\b|drift|pura car|vent|dealership|detailer|driving/.test(t)) return CAR;
  if (/hotel|gym|spa|salon|dental|restaurant|\bbar\b|retail|boutique|business|aroma360|airbnb|staging|commercial|office|hvac/.test(t)) return COMMERCIAL;
  return HOME; // home / room / whole-house / oil / pets / general
}
