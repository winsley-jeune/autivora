import type { Metadata } from 'next';
import { getProductsByTag } from '@/lib/shopify';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'Autivara Diffuser Oils & Refills — Coming Soon',
  description:
    'Autivara diffuser oils and refills are being prepared. Compatibility, sizes, ingredients, and availability will be published with each verified product.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/scents' },
  openGraph: {
    title: 'The Scent Catalog',
    description: 'High-concentration fragrance oils that refill every Autivara diffuser.',
    url: '/scents',
    type: 'website',
    images: ['/products/autivora-jellyfish-mist-diffuser/autivora-jellyfish-mist-diffuser-1.jpg'],
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
          Verified refill products will appear here when inventory, images, size, and device
          compatibility are confirmed. Until then, no oil is presented as universally compatible.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {oils.map((oil) => (
          <ProductCard
            key={oil.handle}
            handle={oil.handle}
            title={oil.title}
            price={oil.price}
            currencyCode={oil.currencyCode}
            image={oil.image}
            secondaryImage={oil.secondaryImage}
            variantId={oil.variantId}
          />
        ))}

        {oils.length === 0 && (
          <p className="col-span-full text-center text-neutral-400 font-light py-20">
            Scents are loading. Please check back shortly.
          </p>
        )}
      </section>
    </div>
  );
}
