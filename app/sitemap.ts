import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/shopify';
import { HOME_ROOMS, INDUSTRIAL_USE_CASES } from '@/lib/seo-surfaces';
import { SCENTS } from '@/lib/scent-catalog';
import { BLOG_ARTICLES } from '@/lib/blog-data';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://autivara.com';

// Bump when page content meaningfully changes. A stable date Google can trust
// beats a per-request `new Date()` — an always-"now" lastmod gets ignored.
const CONTENT_UPDATED = new Date('2026-06-14');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Top-level pages ─────────────────────────────────────────────────────────
  // /office and /fitment retired (premium-only, no real products) — 301'd in next.config.
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                          lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/auto`,                lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/home`,                lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/industrial`,          lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/scents`,              lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/collection`,          lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/home/rooms`,          lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/industrial/use-cases`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/blog`,                lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/contact`,             lastModified: CONTENT_UPDATED, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/shipping`,            lastModified: CONTENT_UPDATED, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/returns`,             lastModified: CONTENT_UPDATED, changeFrequency: 'yearly',  priority: 0.3 },
  ];

  // ── Shopify product pages ───────────────────────────────────────────────────
  const products = await getProducts({}).catch(() => []);
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/product/${p.handle}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // ── Home rooms ──────────────────────────────────────────────────────────────
  const homeRoomPages: MetadataRoute.Sitemap = HOME_ROOMS.map((r) => ({
    url: `${BASE_URL}/home/rooms/${r.slug}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // ── Industrial use cases ────────────────────────────────────────────────────
  const industrialUseCasePages: MetadataRoute.Sitemap = INDUSTRIAL_USE_CASES.map((u) => ({
    url: `${BASE_URL}/industrial/use-cases/${u.slug}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // ── Scent catalog (coming-soon refill line — kept indexed) ──────────────────
  const scentPages: MetadataRoute.Sitemap = SCENTS.map((s) => ({
    url: `${BASE_URL}/scents/${s.id}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
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
    ...homeRoomPages,
    ...industrialUseCasePages,
    ...scentPages,
    ...blogPages,
  ];
}
