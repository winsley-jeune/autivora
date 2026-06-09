import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    label: 'Auto',
    href: '/auto',
    headline: 'Scent beyond motion.',
    blurb: 'Cold-air diffusion engineered for luxury automotive cabins.',
    image: '/image/71aaruoc5QL._AC_SX679_.jpg',
  },
  {
    label: 'Home',
    href: '/home',
    headline: 'The atmosphere of home.',
    blurb: 'Whisper-quiet, residue-free fragrance for every room.',
    image: '/image/61T6CC0ta-L._AC_SL1500_.jpg',
  },
  {
    label: 'Office',
    href: '/office',
    headline: 'Focus, by design.',
    blurb: 'Workspace scenting calibrated for an 8-hour day.',
    image: '/image/71G8FzfKNjL._AC_SX679_.jpg',
  },
  {
    label: 'Industrial',
    href: '/industrial',
    headline: 'Hotel-grade. Indie price.',
    blurb: 'Commercial scenting for the SMBs Aroma360 ignores.',
    image: '/image/6182hqWxxcL._AC_SL1500_.jpg',
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
            src="/image/61YkBrJrPhL._AC_SL1500_.jpg"
            alt="Autivora"
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
            Precision cold-air nebulization across automotive, residential, workplace, and
            commercial environments. One technology. Every space.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/scents"
              className="bg-white text-black px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all rounded-sm"
            >
              The Scent Catalog
            </Link>
            <Link
              href="/auto"
              className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/70 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Credibility strip */}
      <section className="border-y border-neutral-100 py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 flex-1">
            Engineered in Europe
          </span>
          <div className="hidden md:block w-[1px] h-4 bg-neutral-100" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 flex-1">
            Waterless · Heat-Free
          </span>
          <div className="hidden md:block w-[1px] h-4 bg-neutral-100" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 flex-1">
            Precision Cold-Air Nebulization
          </span>
        </div>
      </section>

      {/* 4-category showcase */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            Four Categories. One Standard.
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight">
            Where will you scent?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-neutral-100"
            >
              <Image
                src={cat.image}
                alt={cat.label}
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
              src="/image/81dWe9a1a2L._AC_SY879_.jpg"
              alt="Cold-air nebulization technology"
              fill
              className="object-contain p-12"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
              The Technology
            </span>
            <h2 className="text-4xl font-display font-medium tracking-tight">
              Engineered for the Invisible.
            </h2>
            <p className="text-neutral-500 text-lg font-light leading-relaxed">
              Cold-air nebulization converts undiluted fragrance oil into a dry, nano-sized mist —
              no heat, no water, no residue. The same engineering across every Autivora device,
              calibrated for the space it serves.
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
