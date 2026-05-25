import type { Metadata } from 'next';
import Link from 'next/link';
import { INDUSTRIAL_USE_CASES } from '@/lib/seo-surfaces';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Commercial Scenting Use Cases — Hotels, Salons, Retail, Real Estate & More',
  description:
    'Autivara for commercial scenting. Hotel-grade cold-air diffusion at SMB economics — boutique hotels, salons, retail, real estate staging, fitness studios, medical offices.',
  alternates: { canonical: '/industrial/use-cases' },
  openGraph: {
    title: 'Commercial Scenting Use Cases',
    description: 'Hotel-grade cold-air diffusion at SMB economics.',
    url: '/industrial/use-cases',
    type: 'website',
  },
};

export default function IndustrialUseCasesIndex() {
  return (
    <div className="bg-white min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Industrial Diffusers', url: '/industrial' },
          { name: 'Use Cases', url: '/industrial/use-cases' },
        ]}
      />
      <section className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-6 block">
          Industrial · Use Cases
        </span>
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter mb-8">
          Commercial-grade scenting, indie-business economics.
        </h1>
        <p className="text-xl text-neutral-500 font-light max-w-2xl mx-auto leading-relaxed">
          Hotel Collection and Aroma360 won&apos;t service the under-$500 customer. We will. Pick
          your use case below for setup, placement, and oil recommendations.
        </p>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {INDUSTRIAL_USE_CASES.map((u) => (
          <Link
            key={u.slug}
            href={`/industrial/use-cases/${u.slug}`}
            className="group block border border-neutral-100 rounded-sm p-8 hover:border-black transition-colors space-y-3"
          >
            <h2 className="text-xl font-display font-medium tracking-tight group-hover:underline">
              {u.title}
            </h2>
            <p className="text-sm text-neutral-500 font-light line-clamp-3">{u.intro}</p>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              {u.coverage}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
