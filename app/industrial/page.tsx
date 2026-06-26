import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { INDUSTRIAL_USE_CASES } from '@/lib/seo-surfaces';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import ProductGrid from '@/components/ProductGrid';

export const metadata: Metadata = {
  title: 'Commercial Scent Diffusers — HVAC & Smart Scenting for Business',
  description:
    'Commercial scenting for boutique hotels, salons, retail, gyms, and offices — HVAC scent machines and Wi-Fi smart diffusers at independent-business prices. Month-to-month, real support.',
  alternates: { canonical: '/industrial' },
  openGraph: {
    title: 'Commercial Scent Diffusers — HVAC & Smart Scenting',
    description: 'Hotel-grade commercial scenting at SMB economics.',
    url: '/industrial',
    type: 'website',
    images: ['/products/autivora-atmos-pro-hvac/autivora-atmos-pro-hvac-1.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function IndustrialLanding() {
  return (
    <div className="bg-white text-black min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Industrial Diffusers', url: '/industrial' },
        ]}
      />

      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden px-6 bg-neutral-900 text-white">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-6 block">
            For Commercial Spaces
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.95]">
            Hotel-grade. <br /> Indie price.
          </h1>
          <p className="text-lg md:text-xl text-white/70 font-light max-w-xl mx-auto leading-relaxed mb-12">
            Commercial scenting designed for the businesses Aroma360 and Hotel Collection ignore.
            Month-to-month plans. Real customer support. Transparent pricing.
          </p>
          <Link
            href="/industrial/use-cases"
            className="inline-block bg-white text-black px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all rounded-sm"
          >
            Find Your Use Case
          </Link>
        </div>
      </section>

      {/* Commercial & B2B products (live from Shopify) */}
      <ProductGrid
        tags="industrial-scenting"
        eyebrow="The Range"
        heading="Scale your scent."
        emitItemList
      />

      {/* Pillars */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { h: 'No 3-month lock-in', p: 'Hotel Collection requires a 3-month contract before you can cancel. We do not. Pay monthly. Leave anytime.' },
          { h: 'Real customer support', p: 'Email a real person. Get an answer in under 24 hours. Returns honored without escalation.' },
          { h: 'Multi-unit pricing', p: 'Built-in volume pricing for 5+, 10+, and 25+ unit deployments. No "talk to sales" wall on small properties.' },
        ].map((item) => (
          <div key={item.h} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">{item.h}</h3>
            <p className="text-neutral-600 text-sm font-light leading-relaxed">{item.p}</p>
          </div>
        ))}
      </section>

      {/* Use cases */}
      <section className="bg-neutral-50 py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Browse by Use Case</span>
            <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight">
              From boutique hotel to dental office.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIAL_USE_CASES.map((u) => (
              <Link
                key={u.slug}
                href={`/industrial/use-cases/${u.slug}`}
                className="group block bg-white border border-neutral-100 rounded-sm p-6 hover:border-black transition-colors space-y-2"
              >
                <h3 className="text-lg font-display font-medium tracking-tight group-hover:underline">{u.title}</h3>
                <p className="text-xs text-neutral-500 font-light line-clamp-2">{u.intro}</p>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  {u.coverage}
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center pt-8">
            <Link
              href="/industrial/use-cases"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-neutral-500 transition-colors"
            >
              All Use Cases <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
