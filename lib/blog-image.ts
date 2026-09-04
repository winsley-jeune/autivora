// Prefer a purpose-made editorial hero, then choose a stable, topic-relevant
// product photo. The larger fallback pools keep the journal from looking like
// every article is advertising the same three products.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

function productImages(handle: string, count = 4): string[] {
  return Array.from(
    { length: count },
    (_, index) => `/products/${handle}/${handle}-${index + 1}.jpg`,
  );
}

const CAR_IMAGES = [
  ...productImages('autivora-astronaut-car-diffuser'),
  ...productImages('autivora-bear-propeller-diffuser'),
  ...productImages('autivora-guitar-car-diffuser'),
  ...productImages('autivora-magnetic-vent-diffuser'),
  ...productImages('autivora-pear-car-diffuser', 2),
  ...productImages('autivora-rechargeable-car-diffuser'),
  ...productImages('autivora-smart-spray-diffuser'),
];

const HOME_IMAGES = [
  ...productImages('autivora-4l-humidifying-diffuser'),
  ...productImages('autivora-disco-ball-diffuser'),
  ...productImages('autivora-fireplace-flame-diffuser'),
  ...productImages('autivora-jellyfish-mist-diffuser'),
  ...productImages('autivora-rocket-flame-diffuser'),
  ...productImages('autivora-steam-train-diffuser'),
  ...productImages('autivora-volcano-flame-diffuser', 3),
  ...productImages('autivora-wood-grain-diffuser'),
];

const COMMERCIAL_IMAGES = [
  ...productImages('autivora-atmos-pro-hvac'),
  ...productImages('autivora-atmos-wifi-diffuser'),
  ...productImages('autivora-smart-plug-diffuser'),
  ...productImages('autivora-wood-grain-diffuser'),
];

type ImageTopic = 'car' | 'home' | 'commercial';

const TOPIC_OVERRIDES: Record<string, ImageTopic> = {
  'how-to-make-your-house-smell-like-a-hotel': 'home',
  'how-to-make-your-home-smell-like-a-spa': 'home',
  'why-do-boutiques-and-stores-smell-so-good': 'home',
  'what-is-scent-marketing': 'commercial',
  'how-to-make-your-coffee-shop-smell-good': 'commercial',
};

function hasGeneratedImage(slug: string): boolean {
  return existsSync(join(process.cwd(), 'public', 'blog', `${slug}.jpg`));
}

function stableIndex(value: string, length: number): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

function imageTopic(article: { slug: string; title: string; category?: string }): ImageTopic {
  if (TOPIC_OVERRIDES[article.slug]) return TOPIC_OVERRIDES[article.slug];

  const text = `${article.slug} ${article.title} ${article.category ?? ''}`.toLowerCase();
  if (/\bcar\b|vehicle|tesla|\bev\b|drift|pura car|vent|dealership|detailer|driving/.test(text)) {
    return 'car';
  }
  if (/hotel|gym|spa|salon|dental|restaurant|\bbar\b|retail|boutique|business|aroma360|airbnb|staging|commercial|office|hvac/.test(text)) {
    return 'commercial';
  }
  return 'home';
}

export function blogImage(article: { slug: string; title: string; category?: string }): string {
  if (hasGeneratedImage(article.slug)) return `/blog/${article.slug}.jpg`;

  const topic = imageTopic(article);
  const pool = topic === 'car' ? CAR_IMAGES : topic === 'commercial' ? COMMERCIAL_IMAGES : HOME_IMAGES;
  return pool[stableIndex(article.slug, pool.length)];
}
