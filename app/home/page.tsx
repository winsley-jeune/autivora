import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { HOME_ROOMS } from '@/lib/seo-surfaces';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Home Diffusers — Cold-Air Fragrance for Every Room',
  description:
    'Whisper-quiet cold-air diffusion designed for living rooms, bedrooms, kitchens, bathrooms, nurseries, and entryways. Zero residue on hardwood, upholstery, or stone.',
  alternates: { canonical: '/home' },
  openGraph: {
    title: 'Home Diffusers — Cold-Air Fragrance for Every Room',
    description: 'Whisper-quiet cold-air diffusion designed for every room in your home.',
    url: '/home',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function HomeLanding() {
  return (
    <div className="bg-white text-black min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Home Diffusers', url: '/home' },
        ]}
      />

      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden px-6 bg-neutral-50">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-6 block">
            For Every Room
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.95]">
            The atmosphere <br /> of home.
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 font-light max-w-xl mx-auto leading-relaxed mb-12">
            Cold-air nebulization engineered for residential spaces. Safe on hardwood, leather,
            upholstery, and stone. Whisper-quiet at 40dB.
          </p>
          <Link
            href="/home/rooms"
            className="inline-block bg-black text-white px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all rounded-sm"
          >
            Find Your Room
          </Link>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { h: 'Zero residue', p: 'Dry nano-mist with no water carrier. Safe on hardwood floors, upholstery, leather, marble, and wood furniture.' },
          { h: 'Whisper-quiet', p: '40dB operation — quieter than a refrigerator. Will not disturb sleep, reading, or conversation.' },
          { h: 'Room-calibrated', p: 'Adjustable intensity from 1 (nursery) to 5 (large kitchen). Pre-loaded room profiles in the app.' },
        ].map((item) => (
          <div key={item.h} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">{item.h}</h3>
            <p className="text-neutral-600 text-sm font-light leading-relaxed">{item.p}</p>
          </div>
        ))}
      </section>

      {/* Featured rooms */}
      <section className="bg-neutral-50 py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Browse by Room</span>
            <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight">
              Different rooms, different needs.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOME_ROOMS.slice(0, 6).map((r) => (
              <Link
                key={r.slug}
                href={`/home/rooms/${r.slug}`}
                className="group block bg-white border border-neutral-100 rounded-sm p-6 hover:border-black transition-colors space-y-2"
              >
                <h3 className="text-lg font-display font-medium tracking-tight group-hover:underline">{r.title}</h3>
                <p className="text-xs text-neutral-500 font-light line-clamp-2">{r.intro}</p>
              </Link>
            ))}
          </div>
          <div className="text-center pt-8">
            <Link
              href="/home/rooms"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-neutral-500 transition-colors"
            >
              All Room Guides <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
