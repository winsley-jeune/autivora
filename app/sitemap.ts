import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/shopify';
import { LUXURY_BRANDS } from '@/lib/mock-db';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://autivora.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                        lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/collection`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/fitment`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/shipping`,          lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/returns`,           lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];

  // ── Dynamic product pages from Shopify ────────────────────────────────────
  const products = await getProducts({}).catch(() => []);
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/product/${p.handle}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // ── Vehicle fitment pages from mock-db ────────────────────────────────────
  const fitmentPages: MetadataRoute.Sitemap = Object.entries(LUXURY_BRANDS).flatMap(
    ([brand, models]) =>
      Object.keys(models).map((model) => ({
        url: `${BASE_URL}/fitment/${brand}/${model}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
  );

  return [...staticPages, ...productPages, ...fitmentPages];
}
