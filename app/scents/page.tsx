import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SCENTS } from '@/lib/scent-catalog';
import { getUpsellProducts } from '@/lib/shopify';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'The Scent Catalog — Refill Oils for Every Autivara Diffuser',
  description:
    'Browse the full Autivara scent catalog. Cold-air formulated essential-oil blends compatible with every Autivara diffuser — auto, home, office, industrial.',
  alternates: { canonical: '/scents' },
  openGraph: {
    title: 'The Scent Catalog',
    description: 'Cold-air formulated essential-oil blends for every Autivara diffuser.',
    url: '/scents',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default async function ScentsCatalog() {
  const productIds = SCENTS.map((s) => s.productId);
  const live = await getUpsellProducts(productIds).catch(() => []);

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
          Each Autivara scent is formulated for cold-air nebulization and engineered to perform
          across automotive, residential, workplace, and commercial environments.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SCENTS.map((scent) => {
          const liveProduct = live.find((p) => p.id === scent.productId);
          const price = liveProduct
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: liveProduct.priceRange.minVariantPrice.currencyCode,
              }).format(parseFloat(liveProduct.priceRange.minVariantPrice.amount))
            : '$35.00';
          const image = liveProduct?.featuredImage?.url;
          const name = liveProduct?.title ?? scent.id;
          return (
            <Link
              key={scent.id}
              href={`/scents/${scent.id}`}
              className="group block space-y-4 border border-neutral-100 rounded-sm p-6 hover:border-black transition-colors"
            >
              <div className="relative aspect-square bg-neutral-50 rounded-sm overflow-hidden">
                {image ? (
                  <Image
                    src={image}
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
                <h2 className="text-xl font-display font-medium tracking-tight group-hover:underline">{name}</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{scent.notes}</p>
                <p className="text-sm text-neutral-500 font-light leading-relaxed">{scent.description}</p>
                <p className="text-sm font-medium text-neutral-900 pt-2">{price}</p>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
