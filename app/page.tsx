import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: {
    absolute: 'Autivara — Design-Led Scent Diffusers for Car, Home & Commercial',
  },
  description:
    'Statement aroma diffusers with personality — flame-effect, mist, vent-clip, and commercial scent machines for the car, home, and business. Excellence in air.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Autivara — Design-Led Scent Diffusers',
    description: 'Statement aroma diffusers for car, home, and commercial spaces.',
    url: '/',
    type: 'website',
  },
};

const CATEGORIES = [
  {
    label: 'Car',
    href: '/auto',
    headline: 'Scent that moves with you.',
    blurb: 'Vent clips, solar spinners, and rechargeable diffusers for every cabin.',
    image: '/products/autivora-astronaut-car-diffuser/autivora-astronaut-car-diffuser-1.jpg',
  },
  {
    label: 'Home',
    href: '/home',
    headline: 'Ambience you can switch on.',
    blurb: 'Flame-glow, mist, and light-show diffusers for every room.',
    image: '/products/autivora-volcano-flame-diffuser/autivora-volcano-flame-diffuser-1.jpg',
  },
  {
    label: 'Commercial',
    href: '/industrial',
    headline: 'Scaled scenting.',
    blurb: 'Wi-Fi and HVAC scent machines for offices, lobbies, and venues.',
    image: '/products/autivora-atmos-pro-hvac/autivora-atmos-pro-hvac-1.jpg',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Editorial Hero */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/30 z-10" />
          <Image
            src="/products/autivora-disco-ball-diffuser/autivora-disco-ball-diffuser-1.jpg"
            alt="Autivara disco-ball aroma diffuser glowing in a dark room"
            fill
            priority
            className="object-cover grayscale"
            sizes="100vw"
          />
        </div>

        <div className="relative z-20 text-center max-w-5xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/90 mb-8 block">
            The New Olfactory Standard
          </span>
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-8 leading-[0.9] text-white">
            Excellence <br /> In Air.
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light mb-12 leading-relaxed">
            Design-led aroma diffusers with personality — flame-effect, mist, vent-clip, and
            commercial scent machines for the car, the home, and business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="#collections"
              className="bg-white text-black px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all rounded-sm"
            >
              Explore Collections
            </Link>
            <Link
              href="/collection"
              className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/70 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
            >
              Shop All Diffusers
            </Link>
          </div>
        </div>
      </section>

      {/* Credibility strip */}
      <section className="border-y border-neutral-100 py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 flex-1">
            Design-Led Diffusers
          </span>
          <div className="hidden md:block w-[1px] h-4 bg-neutral-100" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 flex-1">
            Refillable · No Cartridges
          </span>
          <div className="hidden md:block w-[1px] h-4 bg-neutral-100" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 flex-1">
            Car · Home · Commercial
          </span>
        </div>
      </section>

      {/* Our Collections */}
      <section id="collections" className="scroll-mt-24 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            Shop by Space
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight">
            Our Collections
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-neutral-100"
            >
              <Image
                src={cat.image}
                alt={`Autivara ${cat.label.toLowerCase()} scent diffusers`}
                fill
                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/70 mb-4">
                  {cat.label}
                </span>
                <h3 className="text-3xl lg:text-5xl font-display font-bold tracking-tighter mb-3 leading-[0.95]">
                  {cat.headline}
                </h3>
                <p className="text-white/80 font-light max-w-sm mb-6">{cat.blurb}</p>
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] border-b border-white/40 group-hover:border-white pb-1 w-max transition-colors">
                  Explore {cat.label} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Technology / brand ethos */}
      <section className="py-32 px-6 bg-neutral-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative aspect-square flex items-center justify-center bg-white rounded-sm overflow-hidden">
            <Image
              src="/products/autivora-wood-grain-diffuser/autivora-wood-grain-diffuser-1.jpg"
              alt="Autivara wood-grain aroma diffuser"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
              The Idea
            </span>
            <h2 className="text-4xl font-display font-medium tracking-tight">
              Scent, with a personality.
            </h2>
            <p className="text-neutral-500 text-lg font-light leading-relaxed">
              From a glowing volcano to a spinning astronaut, every Autivara diffuser is built to be
              displayed, not hidden — pairing a real fragrance oil with a design you actually want to
              look at. Refill it whenever the mood changes.
            </p>
            <Link
              href="/scents"
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-neutral-500 transition-colors"
            >
              The Scent Catalog <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
