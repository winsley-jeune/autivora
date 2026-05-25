import type { Metadata } from 'next';
import Link from 'next/link';
import { OFFICE_SIZES } from '@/lib/seo-surfaces';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Office Diffusers by Size — Private, Team, Open-Plan & Meeting Room',
  description:
    'Find the right Autivara setup for your office. Scenting recommendations from solo private offices to open-plan agencies and boutique coworking spaces.',
  alternates: { canonical: '/office/sizes' },
  openGraph: {
    title: 'Office Diffusers by Size',
    description: 'From private offices to open-plan agencies — sized-right scenting.',
    url: '/office/sizes',
    type: 'website',
  },
};

export default function OfficeSizesIndex() {
  return (
    <div className="bg-white min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Office Diffusers', url: '/office' },
          { name: 'Office Sizes', url: '/office/sizes' },
        ]}
      />
      <section className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-6 block">
          Office · Sizes
        </span>
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter mb-8">
          Sized-right scenting.
        </h1>
        <p className="text-xl text-neutral-500 font-light max-w-2xl mx-auto leading-relaxed">
          From a 100 sqft private office to a 2,000 sqft open-plan agency — single-unit or array
          deployment, calibrated to your workspace.
        </p>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-32 grid grid-cols-1 sm:grid-cols-2 gap-8">
        {OFFICE_SIZES.map((s) => (
          <Link
            key={s.slug}
            href={`/office/sizes/${s.slug}`}
            className="group block border border-neutral-100 rounded-sm p-8 hover:border-black transition-colors space-y-3"
          >
            <h2 className="text-xl font-display font-medium tracking-tight group-hover:underline">
              {s.title}
            </h2>
            <p className="text-sm text-neutral-500 font-light line-clamp-3">{s.intro}</p>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              {s.coverage}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
