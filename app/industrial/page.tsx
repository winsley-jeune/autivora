import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import ProductGrid from '@/components/ProductGrid';
import CategoryFaq from '@/components/CategoryFaq';

const INDUSTRIAL_FAQ = [
  {
    question: 'How does commercial scenting cover a large space?',
    answer:
      'Commercial models may use waterless nebulizing technology, direct room placement, or an HVAC connection. Check the individual product specifications for the required liquid, installation method, and stated coverage.',
  },
  {
    question: 'Do I need a long-term contract?',
    answer:
      'The listed devices are sold as products rather than advertised equipment leases. Review the current product, payment, shipping, and return terms before purchasing.',
  },
  {
    question: 'Can I schedule when it runs and how strong it is?',
    answer:
      'Selected models list Wi-Fi or app scheduling. Confirm the controls and compatibility on the individual product page before selecting a unit.',
  },
  {
    question: 'What size space can one unit cover?',
    answer:
      'It depends on the model, room volume, airflow, operating schedule, and placement. Use the stated product specifications as a starting point and confirm installation requirements before purchasing.',
  },
];

export const metadata: Metadata = {
  title: 'Commercial Scent Diffusers — HVAC & Smart Scenting for Business',
  description:
    'Compare commercial scent diffusers for hospitality, retail, salons, gyms, and offices, including waterless HVAC and Wi-Fi models.',
  alternates: { canonical: '/industrial' },
  openGraph: {
    title: 'Commercial Scent Diffusers — HVAC & Smart Scenting',
    description: 'Compare commercial scent diffusers by installation type, controls, and listed specifications.',
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
            Commercial scenting, <br /> clearly compared.
          </h1>
          <p className="text-lg md:text-xl text-white/70 font-light max-w-xl mx-auto leading-relaxed mb-12">
            Compare waterless HVAC, wall-mounted, and plug-in scent diffusers by installation type,
            controls, and listed price.
          </p>
          <Link
            href="/collection"
            className="inline-block bg-white text-black px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all rounded-sm"
          >
            Shop Diffusers
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
          { h: 'Choose an installation', p: 'Compare standalone, wall-mounted, plug-in, and HVAC-connected formats using the product specifications.' },
          { h: 'Check the controls', p: 'Scheduling, intensity settings, Wi-Fi, and app support vary by model and are stated on each product page.' },
          { h: 'Plan for the space', p: 'Room layout, airflow, operating hours, and placement affect performance; confirm fit before purchasing.' },
        ].map((item) => (
          <div key={item.h} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">{item.h}</h3>
            <p className="text-neutral-600 text-sm font-light leading-relaxed">{item.p}</p>
          </div>
        ))}
      </section>

      {/* Buying guide link (pillar) */}
      <section className="px-6 py-8">
        <div className="max-w-3xl mx-auto bg-neutral-50 rounded-sm p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Scenting a business?</span>
            <p className="text-base font-display font-medium tracking-tight">Read the complete commercial scent diffuser guide.</p>
          </div>
          <Link
            href="/blog/best-commercial-scent-diffuser"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-neutral-500 transition-colors whitespace-nowrap"
          >
            Read the Guide <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Category FAQ */}
      <CategoryFaq heading="Commercial scenting questions" items={INDUSTRIAL_FAQ} />
    </div>
  );
}
