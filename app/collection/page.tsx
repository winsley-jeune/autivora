import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getProducts } from '@/lib/shopify';
import { SIGNATURE_OILS } from '@/lib/upsell-products';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'Collection | Autivora',
  description: 'The Autivora collection — precision automotive fragrance devices.',
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
          Precision Scent.
        </h1>
        {/* Trust strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Ships in 24 h
          </span>
          <span className="text-neutral-200 hidden sm:block">·</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            Free Shipping Over $100
          </span>
          <span className="text-neutral-200 hidden sm:block">·</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            30-Day Returns
          </span>
        </div>
      </section>

      {/* ── The Device ── */}
      {devices.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          <div className="flex items-center gap-6 mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
              The Device
            </span>
            <div className="flex-1 h-[1px] bg-neutral-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {devices.map((product) => (
              <ProductCard key={product.id} product={product} />
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
            20ml cold-air compatible refills — formulated exclusively for the Autivora device.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {oils.map((product) => (
              <ProductCard key={product.id} product={product} />
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
