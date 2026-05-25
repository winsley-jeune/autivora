import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Car Diffusers — Luxury Automotive Fragrance',
  description:
    'Precision cold-air diffusers designed for the luxury automotive cabin. Aerospace-grade aluminum, 48-hour battery, vehicle-specific scent pairings for Porsche, BMW, Mercedes, and more.',
  alternates: { canonical: '/auto' },
  openGraph: {
    title: 'Car Diffusers — Luxury Automotive Fragrance',
    description:
      'Precision cold-air diffusers designed for the luxury automotive cabin.',
    url: '/auto',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function AutoLanding() {
  return (
    <div className="bg-white text-black min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Auto', url: '/auto' },
        ]}
      />

      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/30 z-10" />
          <Image
            src="/image/71aaruoc5QL._AC_SX679_.jpg"
            alt="Autivara in luxury vehicle cabin"
            fill
            priority
            className="object-cover grayscale"
            sizes="100vw"
          />
        </div>
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/80 mb-6 block">
            For the Cabin
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter mb-8 leading-[0.95]">
            Scent <br /> Beyond Motion.
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-light max-w-xl mx-auto leading-relaxed mb-12">
            Cold-air nebulization engineered for the luxury automotive cabin. No water. No heat.
            Just signature scent — calibrated to your vehicle.
          </p>
          <Link
            href="/product/autivara-one"
            className="inline-block bg-white text-black px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all rounded-sm"
          >
            Shop The One
          </Link>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { h: 'Aerospace-grade aluminum', p: 'Machined from a single block. Anodized to a satin finish that complements luxury cabin materials.' },
          { h: '48-hour battery', p: 'USB-C charging. Cordless freedom for weeks of commuting between charges.' },
          { h: 'Vehicle-specific fit', p: 'Compatibility data across 17 luxury brands. Cup-holder, dash, or vent placement guides per vehicle.' },
        ].map((item) => (
          <div key={item.h} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">{item.h}</h3>
            <p className="text-neutral-600 text-sm font-light leading-relaxed">{item.p}</p>
          </div>
        ))}
      </section>

      {/* Featured product */}
      <section className="bg-neutral-50 py-32 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square bg-white rounded-sm overflow-hidden">
            <Image
              src="/image/81dWe9a1a2L._AC_SY879_.jpg"
              alt="The Autivara One"
              fill
              className="object-contain p-12"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">The Device</span>
            <h2 className="text-4xl lg:text-5xl font-display font-medium tracking-tight">The Autivara One.</h2>
            <p className="text-neutral-500 text-lg font-light leading-relaxed">
              Designed for the luxury cabin. 65mm diameter fits all standard cup holders, 220g
              total weight, whisper-quiet 40dB operation.
            </p>
            <Link
              href="/product/autivara-one"
              className="inline-block bg-black text-white px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all rounded-sm"
            >
              View Product
            </Link>
          </div>
        </div>
      </section>

      {/* Fitment CTA */}
      <section className="py-32 px-6 text-center max-w-3xl mx-auto space-y-8">
        <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight">
          Find your vehicle.
        </h2>
        <p className="text-neutral-500 font-light leading-relaxed">
          Vehicle-specific placement, intensity, and scent-pairing guides across Porsche, BMW,
          Mercedes-Benz, Audi, Ferrari, Lamborghini, Bentley, Rolls-Royce, and 9 more luxury
          marques.
        </p>
        <Link
          href="/fitment"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-neutral-500 transition-colors"
        >
          Browse Vehicle Compatibility <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
