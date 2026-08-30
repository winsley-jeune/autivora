import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import ProductGrid from '@/components/ProductGrid';
import CategoryFaq from '@/components/CategoryFaq';
import CollectionGrowthContent from '@/components/CollectionGrowthContent';

const AUTO_FAQ = [
  {
    question: 'What is a waterless car diffuser?',
    answer:
      'A waterless car diffuser disperses fragrance without a water reservoir. Passive vent clips use cabin airflow, while rechargeable models meter scent from their own chamber. Always follow the refill and placement instructions for the specific model.',
  },
  {
    question: 'Are car vent diffusers better than hanging air fresheners?',
    answer:
      'Vent clips are refillable and use airflow from an active vent to disperse scent. Strength and refill frequency vary with the oil, number of drops, climate, and how often you drive.',
  },
  {
    question: 'Do Autivara car diffusers use water or batteries?',
    answer:
      'The current range includes passive waterless vent clips and USB-C rechargeable models. Check the individual product page for its power source, refill method, and controls.',
  },
  {
    question: 'Will the oil damage my dashboard or vents?',
    answer:
      'Oil can mark interior materials if a diffuser is overfilled or leaks. Use only the amount specified for the model, keep liquid off trim and upholstery, and wipe any spill promptly according to your vehicle manufacturer’s care guidance.',
  },
  {
    question: 'How strong is the scent in a car?',
    answer:
      'A car cabin is small, so a little goes a long way. Start with two or three drops and add more if you want it stronger. Clipping the diffuser to an active vent increases throw; moving it to the dash makes it more subtle.',
  },
];

export const metadata: Metadata = {
  title: 'Car Diffusers — Vent Clips & Rechargeable Car Scent',
  description:
    'Shop refillable car diffusers, including passive vent clips, sculpted designs, machined metal clips, and USB-C rechargeable models.',
  alternates: { canonical: '/auto' },
  openGraph: {
    title: 'Autivara Car Diffusers',
    description: 'Refillable car vent clips and USB-C rechargeable diffusers.',
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
            Refillable car diffusers for active vents and cabin use — from sculpted clips to machined
            metal and USB-C rechargeable designs.
          </p>
          <Link
            href="/product/autivara-astronaut-car-diffuser"
            className="inline-block bg-white text-black px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all rounded-sm"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { h: 'Waterless options', p: 'Passive vent-clip models use a refillable scent pad or chamber. Follow the product instructions and avoid overfilling.' },
          { h: 'Passive & USB-C', p: 'Choose a no-power vent clip or a rechargeable model with adjustable diffusion features.' },
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
      <CollectionGrowthContent path="/auto" />

      {/* Collection buying guide — commercial guidance belongs on the page that sells. */}
      <section className="px-6 py-20 border-y border-neutral-100">
        <div className="max-w-5xl mx-auto space-y-14">
          <div className="max-w-3xl space-y-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Car diffuser buying guide</span>
            <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight">Choose the format that fits your drive.</h2>
            <p className="text-neutral-600 font-light leading-relaxed">
              Autivara car diffusers are refillable, with passive waterless clips and rechargeable cabin models available. There is no water tank to balance in the car. Compare how each format mounts, disperses scent, and needs to be maintained before choosing.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead><tr className="border-b border-black">{['Format', 'How it works', 'Best for', 'Trade-off'].map((heading) => <th key={heading} className="py-4 pr-6 text-[10px] uppercase tracking-[0.2em]">{heading}</th>)}</tr></thead>
              <tbody className="text-neutral-600 font-light">
                <tr className="border-b border-neutral-200"><td className="py-5 pr-6 font-medium text-black">Vent clip</td><td className="py-5 pr-6">Uses air from an active vent to carry scent.</td><td className="py-5 pr-6">Simple, compact, no charging.</td><td className="py-5 pr-6">Output changes with vent airflow.</td></tr>
                <tr className="border-b border-neutral-200"><td className="py-5 pr-6 font-medium text-black">Rechargeable</td><td className="py-5 pr-6">A powered cabin unit disperses scent independently.</td><td className="py-5 pr-6">More control away from the vent.</td><td className="py-5 pr-6">Requires periodic charging.</td></tr>
                <tr><td className="py-5 pr-6 font-medium text-black">Timed spray</td><td className="py-5 pr-6">Releases scent at controlled intervals.</td><td className="py-5 pr-6">Drivers who prefer intermittent output.</td><td className="py-5 pr-6">Needs the correct refill and settings.</td></tr>
              </tbody>
            </table>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              ['Choose a vent clip when…', 'You want the smallest setup, drive with the vents running, and prefer a device with no battery to manage.'],
              ['Choose rechargeable when…', 'You want scent output that is less dependent on vent airflow and do not mind charging the unit periodically.'],
              ['Start gently', 'A car cabin is compact. Begin with the lowest recommended fill or setting, then increase only after evaluating it during a normal drive.'],
            ].map(([heading, copy]) => <div key={heading} className="space-y-3"><h3 className="text-sm font-display font-semibold">{heading}</h3><p className="text-sm text-neutral-600 font-light leading-relaxed">{copy}</p></div>)}
          </div>
        </div>
      </section>

      {/* Buying guide link (pillar) */}
      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto bg-neutral-50 rounded-sm p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">New to car diffusers?</span>
            <p className="text-base font-display font-medium tracking-tight">Read the complete car diffuser buying guide.</p>
          </div>
          <Link
            href="/blog/best-car-diffuser"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-neutral-500 transition-colors whitespace-nowrap"
          >
            Read the Guide <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Category FAQ */}
      <CategoryFaq heading="Car diffuser questions" items={AUTO_FAQ} />

      {/* Closing CTA */}
      <section className="py-32 px-6 text-center max-w-3xl mx-auto space-y-8">
        <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight">
          A scent for every drive.
        </h2>
        <p className="text-neutral-500 font-light leading-relaxed">
          Compare the rechargeable Cabin diffuser with the passive vent-clip collection to choose
          the format and level of control that fits your drive.
        </p>
        <Link
          href="/product/autivara-rechargeable-car-diffuser"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-neutral-500 transition-colors"
        >
          Shop the Rechargeable Diffuser <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
