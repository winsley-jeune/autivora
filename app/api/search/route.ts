import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/shopify';
import { BLOG_ARTICLES } from '@/lib/blog-data';
import { brandName } from '@/lib/brand';

export const runtime = 'nodejs';

// Live typeahead source for the header search overlay. Returns a trimmed,
// client-safe shape (no variant internals beyond what a card needs).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();
  if (!q) return NextResponse.json({ products: [], articles: [] });

  const t = q.toLowerCase();
  const found = await searchProducts(q).catch(() => []);

  const products = found.slice(0, 6).map((p) => ({
    handle: p.handle,
    title: brandName(p.title),
    price: p.price,
    currencyCode: p.currencyCode,
    image: p.image ?? null,
  }));

  const articles = BLOG_ARTICLES.filter((a) =>
    `${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(t),
  )
    .slice(0, 4)
    .map((a) => ({ slug: a.slug, title: a.title, category: a.category }));

  return NextResponse.json({ products, articles });
}
