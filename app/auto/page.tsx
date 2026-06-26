import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import ProductGrid from '@/components/ProductGrid';

export const metadata: Metadata = {
  title: 'Car Diffusers — Vent Clips, Solar & Smart Car Scent',
  description:
    'Design-led car scent diffusers: astronaut and novelty vent clips, solar-spun diffusers, and rechargeable smart diffusers. Waterless, refillable, and built to look good on your dash.',
  alternates: { canonical: '/auto' },
  openGraph: {
    title: 'Autivara Car Diffusers',
    description: 'Statement car diffusers — vent clips, solar spinners, and smart diffusers.',
    url: '/auto',
    type: 'website',
    images: ['/products/autivora-astronaut-car-diffuser/autivora-astronaut-car-diffuser-1.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function AutoLanding() {
  return (
    <div className="bg-white text-black min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Car', url: '/auto' },
        ]}
      />

      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <Image
            src="/products/autivora-astronaut-car-diffuser/autivora-astronaut-car-diffuser-1.jpg"
            alt="Autivara astronaut car vent diffuser"
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
            Statement diffusers for your dashboard — from astronaut vent clips to solar spinners and
            rechargeable smart diffusers. Waterless, refillable, and made to be seen.
          </p>
          <Link
            href="/product/autivora-astronaut-car-diffuser"
            className="inline-block bg-white text-black px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all rounded-sm"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { h: 'Waterless & refillable', p: 'Clips to any air vent, a few drops of oil — no water, no spills, no residue on your interior.' },
          { h: 'Solar & USB-C', p: 'From solar-spun rotors that turn in sunlight to USB-C rechargeable smart diffusers — power that fits how you drive.' },
          { h: 'Designed to be shown', p: 'Crafted designs — sculpted figures and machined metal — that look as considered as they smell.' },
        ].map((item) => (
          <div key={item.h} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">{item.h}</h3>
            <p className="text-neutral-600 text-sm font-light leading-relaxed">{item.p}</p>
          </div>
        ))}
      </section>

      {/* Car products (live from Shopify) */}
      <ProductGrid tags="car-diffusers" eyebrow="The Collection" heading="Built for the cabin." emitItemList />

      {/* Closing CTA */}
      <section className="py-32 px-6 text-center max-w-3xl mx-auto space-y-8">
        <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight">
          A scent for every drive.
        </h2>
        <p className="text-neutral-500 font-light leading-relaxed">
          Pair any diffuser with an Autivara fragrance oil and refresh it whenever the mood changes —
          no cartridges, no waste.
        </p>
        <Link
          href="/scents"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-neutral-500 transition-colors"
        >
          Explore the Scents <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
