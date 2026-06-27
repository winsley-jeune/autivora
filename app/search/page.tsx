import type { Metadata } from 'next';
import Link from 'next/link';
import { searchProducts } from '@/lib/shopify';
import { BLOG_ARTICLES } from '@/lib/blog-data';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Autivara diffusers, scents, and guides.',
  alternates: { canonical: '/search' },
  // Internal search-results pages should not be indexed (thin/duplicate), but
  // the page still powers the WebSite SearchAction and on-site search.
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string }> };

function searchArticles(term: string) {
  const t = term.toLowerCase();
  return BLOG_ARTICLES.filter((a) =>
    `${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(t),
  ).slice(0, 6);
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const query = q.trim();

  const [products, articles] = query
    ? [await searchProducts(query), searchArticles(query)]
    : [[], []];

  const hasResults = products.length > 0 || articles.length > 0;

  return (
    <div className="bg-white text-black min-h-screen">
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        <div className="space-y-6 mb-16 border-b border-neutral-100 pb-12">
          <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tighter leading-[1]">
            Search
          </h1>
          <form action="/search" method="get" className="flex gap-3 max-w-xl">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search diffusers, scents, guides…"
              aria-label="Search"
              autoFocus
              className="flex-1 border border-neutral-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
            <button
              type="submit"
              className="bg-black text-white px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-neutral-800 transition-colors"
            >
              Search
            </button>
          </form>
          {query && (
            <p className="text-sm text-neutral-400 font-light">
              {hasResults
                ? `Results for “${query}”`
                : `No results for “${query}”.`}
            </p>
          )}
        </div>

        {/* Product results */}
        {products.length > 0 && (
          <section className="mb-20">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-400 mb-8">
              Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p) => (
                <ProductCard
                  key={p.handle}
                  handle={p.handle}
                  title={p.title}
                  price={p.price}
                  currencyCode={p.currencyCode}
                  image={p.image}
                  secondaryImage={p.secondaryImage}
                  variantId={p.variantId}
                />
              ))}
            </div>
          </section>
        )}

        {/* Article results */}
        {articles.length > 0 && (
          <section className="mb-20">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-400 mb-8">
              Guides &amp; Journal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/blog/${a.slug}`}
                  className="group block border border-neutral-100 rounded-sm p-6 hover:border-black transition-colors"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">
                    {a.category}
                  </div>
                  <h3 className="text-lg font-display font-medium tracking-tight group-hover:text-neutral-600 transition-colors mb-1">
                    {a.title}
                  </h3>
                  <p className="text-sm text-neutral-500 font-light line-clamp-2">{a.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty / no-query state */}
        {query && !hasResults && (
          <div className="text-neutral-600 font-light space-y-4">
            <p>We couldn&apos;t find a match. Try a broader term, or browse by collection:</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Car', href: '/auto' },
                { label: 'Home', href: '/home' },
                { label: 'Commercial', href: '/industrial' },
                { label: 'Scents', href: '/scents' },
                { label: 'All Products', href: '/collection' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-xs font-bold uppercase tracking-[0.2em] border border-neutral-200 rounded-sm px-4 py-2 hover:border-black transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {!query && (
          <p className="text-neutral-500 font-light">
            Type above to search diffusers, scents, and guides — or{' '}
            <Link href="/collection" className="underline hover:text-black">
              browse the full collection
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
