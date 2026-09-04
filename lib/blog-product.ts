import type { BlogArticle } from './blog-data';

export type BlogProductRecommendation = {
  handle: string;
  name: string;
  eyebrow: string;
  description: string;
  image: string;
  href: string;
};

const PRODUCTS = {
  car: {
    handle: 'autivora-rechargeable-car-diffuser',
    name: 'Rechargeable Car Diffuser',
    eyebrow: 'Best match for this guide',
    description: 'A rechargeable, adjustable diffuser for a consistent car-scent routine without disposable fresheners.',
  },
  compactCar: {
    handle: 'autivora-magnetic-vent-diffuser',
    name: 'Magnetic Vent Diffuser',
    eyebrow: 'Compact recommendation',
    description: 'A compact vent-mounted option for drivers who want a discreet diffuser with minimal cabin footprint.',
  },
  room: {
    handle: 'autivora-volcano-flame-diffuser',
    name: 'Volcano Flame Diffuser',
    eyebrow: 'Recommended for rooms',
    description: 'A visual flame-effect diffuser suited to bedrooms, living spaces, and everyday home fragrance.',
  },
  calmRoom: {
    handle: 'autivora-jellyfish-mist-diffuser',
    name: 'Jellyfish Mist Diffuser',
    eyebrow: 'Recommended for calm spaces',
    description: 'A relaxing mist display for bedrooms, wind-down routines, and smaller personal spaces.',
  },
  home: {
    handle: 'autivora-wood-grain-diffuser',
    name: 'Wood Grain Diffuser',
    eyebrow: 'Recommended for the home',
    description: 'A warm, furniture-friendly design for shoppers building a more consistent home-fragrance routine.',
  },
  commercial: {
    handle: 'autivora-atmos-wifi-diffuser',
    name: 'Atmos Wi-Fi Diffuser',
    eyebrow: 'Recommended for business spaces',
    description: 'App-controlled scent scheduling for hospitality, retail, office, and customer-facing environments.',
  },
  hvac: {
    handle: 'autivora-atmos-pro-hvac',
    name: 'Atmos Pro HVAC',
    eyebrow: 'Recommended for larger spaces',
    description: 'A higher-capacity HVAC scenting option for larger homes and commercial environments.',
  },
} as const;

function recommendationKey(article: Pick<BlogArticle, 'slug' | 'title' | 'category'>): keyof typeof PRODUCTS {
  const text = `${article.slug} ${article.title} ${article.category}`.toLowerCase();

  if (/\bcar\b|vehicle|tesla|\bev\b|driving|dealership|detailer/.test(text)) {
    return /vent|compact|clip/.test(text) ? 'compactCar' : 'car';
  }
  if (/hvac|whole.house|10,?000|commercial scent diffuser|scent marketing/.test(text)) return 'hvac';
  if (/hotel|gym|spa|salon|dental|restaurant|\bbar\b|retail|boutique|\bstore\b|business|office|airbnb|staging|coffee.shop/.test(text)) {
    return 'commercial';
  }
  if (/sleep|bedroom|anxiety|stress|calm|relax/.test(text)) return 'calmRoom';
  if (/apartment|bathroom|living.room|flame|desk|small room/.test(text)) return 'room';
  return 'home';
}

export function blogProduct(article: Pick<BlogArticle, 'slug' | 'title' | 'category'>): BlogProductRecommendation {
  const product = PRODUCTS[recommendationKey(article)];
  const campaign = encodeURIComponent(article.slug);
  return {
    ...product,
    image: `/products/${product.handle}/${product.handle}-1.jpg`,
    href: `/product/${product.handle}?utm_source=blog&utm_medium=organic&utm_campaign=${campaign}&utm_content=article-recommendation`,
  };
}
