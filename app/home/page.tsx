import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HOME_ROOMS } from '@/lib/seo-surfaces';
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
      'No. The "flame" is LED light shining up through the rising mist to mimic a flickering fire, and the light-show models cycle colored LEDs. Everything stays cool to the touch — safe to leave running on a shelf or nightstand.',
  },
  {
    question: 'How quiet are they?',
    answer:
      'Ultrasonic diffusion is near-silent — most people only hear a faint hum up close. They are designed to run in bedrooms and offices without being a distraction, and they shut off automatically when the water runs out.',
  },
  {
    question: 'How much oil do I use and how often do I refill?',
    answer:
      'Fill the tank with water, add five to ten drops of fragrance oil, and a typical tank runs for several hours. Refill the water when the tank empties and top up the oil to taste — there are no cartridges to replace.',
  },
];

export const metadata: Metadata = {
  title: 'Home Aroma Diffusers — Flame, Mist & Light-Show Diffusers',
  description:
    'Statement home diffusers that turn any room into a mood — flame-effect, jellyfish mist, disco-ball light shows, and minimalist designs. Cool ultrasonic mist, whisper-quiet, auto shut-off.',
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
            a fireplace glow to a mirror-ball light show. Cool to the touch, whisper-quiet, refilled
            in seconds.
          </p>
          <Link
            href="/home/rooms"
            className="inline-block bg-black text-white px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all rounded-sm"
          >
            Find Your Room
          </Link>
        </div>
      </section>

      {/* Home products (live from Shopify) */}
      <ProductGrid tags="home-diffusers" eyebrow="The Collection" heading="For every room." emitItemList />

      {/* Pillars */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { h: 'Mood, not just scent', p: 'Flame-effect glow, rising mist, and color light shows — ambience and fragrance in one piece.' },
          { h: 'Cool mist, no heat', p: 'Ultrasonic cool-mist diffusion runs quiet and never hot, with auto shut-off when the tank runs dry.' },
          { h: 'Made to display', p: 'Volcano, jellyfish, mirror-ball, steam-train, wood-grain — pieces you will want on display.' },
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
              Different rooms, different moods.
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
