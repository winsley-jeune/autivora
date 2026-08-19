import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import ProductGrid from '@/components/ProductGrid';
import CategoryFaq from '@/components/CategoryFaq';

const HOME_FAQ = [
  {
    question: 'Is an ultrasonic diffuser the same as a humidifier?',
    answer:
      'They share the cool-mist technology, but a diffuser is built for fragrance — a smaller tank, finer mist, and a design meant to be displayed. You add a few drops of oil to the water and it disperses scent and a little moisture into the room without any heat.',
  },
  {
    question: 'Do the flame and light-show diffusers actually use fire?',
    answer:
      'No. On flame-effect models, LED light shines through the mist to create the visual effect. Follow the individual model instructions, placement guidance, and automatic shut-off information.',
  },
  {
    question: 'How quiet are they?',
    answer:
      'Ultrasonic models generally produce a low operating hum, but measured noise and shut-off features vary by model. Check the product page and manual before choosing one for sleep or work.',
  },
  {
    question: 'How much oil do I use and how often do I refill?',
    answer:
      'Capacity, compatible liquids, and recommended oil quantity vary by model. Follow the product instructions rather than using one dosage across the entire range.',
  },
];

export const metadata: Metadata = {
  title: 'Home Aroma Diffusers — Flame, Mist & Light-Show Diffusers',
  description:
    'Shop home aroma diffusers with flame-effect mist, sculptural designs, light features, and large-capacity options. Compare features on each product page.',
  alternates: { canonical: '/home' },
  openGraph: {
    title: 'Autivara Home Diffusers',
    description: 'Flame-glow, mist, and light-show diffusers that turn any room into a mood.',
    url: '/home',
    type: 'website',
    images: ['/products/autivora-volcano-flame-diffuser/autivora-volcano-flame-diffuser-1.jpg'],
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
            Ambience you <br /> can switch on.
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 font-light max-w-xl mx-auto leading-relaxed mb-12">
            Flame-glow, drifting mist, and light-show diffusers that turn any room into a mood — from
            a fireplace glow to a mirror-ball light show. Compare capacity, controls, and operating
            instructions on each product page.
          </p>
          <Link
            href="/collection"
            className="inline-block bg-black text-white px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all rounded-sm"
          >
            Shop Diffusers
          </Link>
        </div>
      </section>

      {/* Home products (live from Shopify) */}
      <ProductGrid tags="home-diffusers" eyebrow="The Collection" heading="For every room." emitItemList />

      {/* Pillars */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { h: 'Mood, not just scent', p: 'Flame-effect glow, rising mist, and color light shows — ambience and fragrance in one piece.' },
          { h: 'Cool-mist options', p: 'The ultrasonic models use mist and LED light rather than an open flame. Features vary by product.' },
          { h: 'Made to display', p: 'Volcano, jellyfish, mirror-ball, steam-train, wood-grain — pieces you will want on display.' },
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
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Not sure which to pick?</span>
            <p className="text-base font-display font-medium tracking-tight">Read the complete home diffuser buying guide.</p>
          </div>
          <Link
            href="/blog/best-home-diffuser"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-neutral-500 transition-colors whitespace-nowrap"
          >
            Read the Guide <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Category FAQ */}
      <CategoryFaq heading="Home diffuser questions" items={HOME_FAQ} />
    </div>
  );
}
