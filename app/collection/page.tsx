import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts } from '@/lib/shopify';
import { SIGNATURE_OILS } from '@/lib/upsell-products';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'Aroma Diffusers for Car, Home & Business | Autivara',
  description:
    'Shop Autivara aroma diffusers for car vents, home ambience, and commercial spaces. Compare waterless, ultrasonic, USB-C, and HVAC-compatible designs.',
  alternates: { canonical: '/collection' },
  openGraph: {
    title: 'The Autivara Collection',
    description:
      'Aroma diffusers for cars, rooms, and commercial spaces.',
    url: '/collection',
    type: 'website',
    images: ['/products/autivora-disco-ball-diffuser/autivora-disco-ball-diffuser-1.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default async function CollectionPage() {
  const products = await getProducts({}).catch(() => []);

  // Split products into devices and oils using known oil product IDs
  const oilIds = new Set(SIGNATURE_OILS.map((o) => o.productId));
  const devices = products.filter((p) => !oilIds.has(p.id));
  const oils = products.filter((p) => oilIds.has(p.id));

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <section className="pt-32 pb-16 px-6 text-center border-b border-neutral-100">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
          The Collection
        </span>
        <h1 className="mt-4 text-5xl lg:text-7xl font-display font-bold tracking-tighter leading-[0.9]">
          Aroma diffusers for every space.
        </h1>
        <p className="mt-8 text-neutral-500 font-light leading-relaxed max-w-2xl mx-auto">
          Compare refillable car vent diffusers, cool-mist home designs, and waterless commercial
          scent machines. Product pages show the power source, format, and features for each model.
        </p>
        <nav aria-label="Shop diffuser categories" className="mt-10 flex flex-wrap justify-center gap-3">
          {[['Car diffusers', '/auto'], ['Home diffusers', '/home'], ['Commercial diffusers', '/industrial']].map(([label, href]) => (
            <Link key={href} href={href} className="border border-neutral-200 px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] hover:border-black transition-colors">
              {label}
            </Link>
          ))}
        </nav>
      </section>

      {/* ── The Device ── */}
      {devices.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          <div className="flex items-center gap-6 mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
              Available diffusers
            </span>
            <div className="flex-1 h-[1px] bg-neutral-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {devices.map((product) => (
              <ProductCard
                key={product.id}
                handle={product.handle}
                title={product.title}
                price={product.priceRange.minVariantPrice.amount}
                currencyCode={product.priceRange.minVariantPrice.currencyCode}
                image={product.featuredImage?.url}
                secondaryImage={product.images?.edges?.[1]?.node?.url}
                variantId={product.variants?.edges?.[0]?.node?.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Signature Oils ── */}
      {oils.length > 0 && (
        <section id="signature-oils" className="max-w-7xl mx-auto px-6 pt-8 pb-24">
          <div className="flex items-center gap-6 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
              Signature Oils
            </span>
            <div className="flex-1 h-[1px] bg-neutral-100" />
          </div>
          <p className="text-xs text-neutral-400 font-light mb-12">
            Available refill oils. Check each product page for size and device compatibility.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {oils.map((product) => (
              <ProductCard
                key={product.id}
                handle={product.handle}
                title={product.title}
                price={product.priceRange.minVariantPrice.amount}
                currencyCode={product.priceRange.minVariantPrice.currencyCode}
                image={product.featuredImage?.url}
                secondaryImage={product.images?.edges?.[1]?.node?.url}
                variantId={product.variants?.edges?.[0]?.node?.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Fallback if Shopify returns nothing */}
      {products.length === 0 && (
        <section className="max-w-7xl mx-auto px-6 py-32 text-center space-y-4">
          <p className="text-neutral-400 text-sm font-light">No products found.</p>
          <p className="text-neutral-300 text-xs uppercase tracking-widest">
            Add products to your Shopify store to see them here.
          </p>
        </section>
      )}

    </div>
  );
}
