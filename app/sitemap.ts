import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/shopify';
import { BLOG_ARTICLES } from '@/lib/blog-data';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://autivara.com';

// Bump a page's date here when its content meaningfully changes. Real per-page dates (not one
// shared constant) — Google uses lastmod as a freshness signal between URLs, so every static
// page claiming the exact same instant tells it nothing. Values below reflect each page's actual
// last substantive edit.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Top-level pages ─────────────────────────────────────────────────────────
  // /office and /fitment retired (premium-only, no real products) — 301'd in next.config.
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                          lastModified: new Date('2026-06-30'), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/auto`,                lastModified: new Date('2026-06-26'), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/home`,                lastModified: new Date('2026-06-26'), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/industrial`,          lastModified: new Date('2026-06-26'), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/collection`,          lastModified: new Date('2026-06-26'), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/blog`,                lastModified: new Date('2026-07-03'), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/about`,               lastModified: new Date('2026-06-26'), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/faq`,                 lastModified: new Date('2026-06-26'), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`,             lastModified: new Date('2026-06-15'), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/shipping`,            lastModified: new Date('2026-06-15'), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/returns`,             lastModified: new Date('2026-06-15'), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/privacy`,             lastModified: new Date('2026-06-26'), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/terms`,               lastModified: new Date('2026-06-26'), changeFrequency: 'yearly',  priority: 0.2 },
  ];

  // ── Shopify product pages ───────────────────────────────────────────────────
  // Keep in sync with NOT_YET_INDEXABLE in app/product/[handle]/page.tsx —
  // a noindexed page shouldn't also be submitted in the sitemap.
  const NOT_YET_INDEXABLE = new Set(['vanilla-macadamia']);
  const products = (await getProducts({}).catch(() => [])).filter(
    (p) => !NOT_YET_INDEXABLE.has(p.handle)
  );
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/product/${p.handle}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
    images: p.featuredImage?.url ? [p.featuredImage.url] : undefined,
  }));

  // ── Blog articles ───────────────────────────────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = BLOG_ARTICLES.map((a) => ({
    url: `${BASE_URL}/blog/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...productPages,
    ...blogPages,
  ];
}
