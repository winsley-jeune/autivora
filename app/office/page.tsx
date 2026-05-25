import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { OFFICE_SIZES } from '@/lib/seo-surfaces';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Office Diffusers — Workspace & Meeting Room Fragrance',
  description:
    'Cold-air diffusion calibrated for private offices, team workspaces, open-plan agencies, and meeting rooms. Focus profiles, multi-unit array support.',
  alternates: { canonical: '/office' },
  openGraph: {
    title: 'Office Diffusers — Workspace Fragrance',
    description: 'Cold-air diffusion calibrated for private offices through open-plan agencies.',
    url: '/office',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function OfficeLanding() {
  return (
    <div className="bg-white text-black min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Office Diffusers', url: '/office' },
        ]}
      />

      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden px-6 bg-neutral-100">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-6 block">
            For the Workspace
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.95]">
            Focus, <br /> by design.
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 font-light max-w-xl mx-auto leading-relaxed mb-12">
            Workspace scenting engineered for an 8-hour day. Low-distraction profiles, scheduled
            cycles, and inaudible 40dB operation that doesn&apos;t register on video calls.
          </p>
          <Link
            href="/office/sizes"
            className="inline-block bg-black text-white px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all rounded-sm"
          >
            Find Your Setup
          </Link>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { h: 'Microphone-safe', p: 'At 40dB the device is below ambient HVAC noise. Tested with Shure SM7B, Rode NT1, and laptop mics — no pickup.' },
          { h: 'Scheduled cycles', p: 'On/off scheduling avoids scent fatigue. Pre-warm meeting rooms 10 minutes before recurring calendar holds.' },
          { h: 'Multi-unit sync', p: 'For open-plan and large agencies, deploy a synchronized array against your HVAC airflow direction.' },
        ].map((item) => (
          <div key={item.h} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">{item.h}</h3>
            <p className="text-neutral-600 text-sm font-light leading-relaxed">{item.p}</p>
          </div>
        ))}
      </section>

      {/* Sizes */}
      <section className="bg-neutral-50 py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Browse by Size</span>
            <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight">
              From solo desk to open-plan agency.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {OFFICE_SIZES.map((s) => (
              <Link
                key={s.slug}
                href={`/office/sizes/${s.slug}`}
                className="group block bg-white border border-neutral-100 rounded-sm p-6 hover:border-black transition-colors space-y-2"
              >
                <h3 className="text-lg font-display font-medium tracking-tight group-hover:underline">{s.title}</h3>
                <p className="text-xs text-neutral-500 font-light line-clamp-2">{s.intro}</p>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  {s.coverage}
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center pt-8">
            <Link
              href="/office/sizes"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-neutral-500 transition-colors"
            >
              All Office Guides <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
