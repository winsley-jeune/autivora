import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getProductsByTag } from '@/lib/shopify';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'The Scent Catalog — Refill Oils for Every Autivora Diffuser',
  description:
    'Browse the full Autivora scent catalog. Cold-air formulated fragrance oils compatible with every Autivora diffuser — car, home, office, industrial.',
  alternates: { canonical: '/scents' },
  openGraph: {
    title: 'The Scent Catalog',
    description: 'Cold-air formulated fragrance oils for every Autivora diffuser.',
    url: '/scents',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

// Render fresh from Shopify so newly-added oils/images appear automatically.
export const revalidate = 300;

export default async function ScentsCatalog() {
  const oils = await getProductsByTag('fragrance-oil', 'TITLE').catch(() => []);

  return (
    <div className="bg-white min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Scents', url: '/scents' },
        ]}
      />

      <section className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-6 block">
          The Catalog
        </span>
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter mb-8">
          One catalog. <br /> Every space.
        </h1>
        <p className="text-xl text-neutral-500 font-light max-w-2xl mx-auto leading-relaxed">
          Each Autivora scent is formulated for cold-air nebulization and engineered to perform
          across automotive, residential, workplace, and commercial environments.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {oils.map((oil) => {
          const price = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: oil.currencyCode || 'USD',
          }).format(parseFloat(oil.price));
          // "Coastal Linen — Cold-Air Fragrance Oil" → "Coastal Linen"
          const name = oil.title.split('—')[0].trim();
          const blurb = oil.description.slice(0, 90);
          return (
            <Link
              key={oil.handle}
              href={`/product/${oil.handle}`}
              className="group block space-y-4 border border-neutral-100 rounded-sm p-6 hover:border-black transition-colors"
            >
              <div className="relative aspect-square bg-neutral-50 rounded-sm overflow-hidden">
                {oil.image ? (
                  <Image
                    src={oil.image}
                    alt={name}
                    fill
                    className="object-contain mix-blend-multiply p-6"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-display font-medium tracking-tight group-hover:underline">
                  {name}
                </h2>
                {blurb && (
                  <p className="text-sm text-neutral-500 font-light leading-relaxed">{blurb}…</p>
                )}
                <p className="text-sm font-medium text-neutral-900 pt-2">From {price}</p>
              </div>
            </Link>
          );
        })}

        {oils.length === 0 && (
          <p className="col-span-full text-center text-neutral-400 font-light py-20">
            Scents are loading. Please check back shortly.
          </p>
        )}
      </section>
    </div>
  );
}
