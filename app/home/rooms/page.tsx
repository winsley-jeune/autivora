import type { Metadata } from 'next';
import Link from 'next/link';
import { HOME_ROOMS } from '@/lib/seo-surfaces';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Diffusers by Room — Living Room, Bedroom, Kitchen & More',
  description:
    'Browse Autivora diffuser recommendations by room. Scent pairings, intensity, and placement guides for every space in your home.',
  alternates: { canonical: '/home/rooms' },
  openGraph: {
    title: 'Diffusers by Room',
    description: 'Scent pairings, intensity, and placement guides for every space in your home.',
    url: '/home/rooms',
    type: 'website',
  },
};

export default function HomeRoomsIndex() {
  return (
    <div className="bg-white min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Home Diffusers', url: '/home' },
          { name: 'Rooms', url: '/home/rooms' },
        ]}
      />
      <section className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-6 block">
          Home · Rooms
        </span>
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter mb-8">
          Diffusers by Room.
        </h1>
        <p className="text-xl text-neutral-500 font-light max-w-2xl mx-auto leading-relaxed">
          Every room has different scent needs. Browse our placement, intensity, and pairing
          guides — calibrated for the way each space is actually used.
        </p>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {HOME_ROOMS.map((r) => (
          <Link
            key={r.slug}
            href={`/home/rooms/${r.slug}`}
            className="group block border border-neutral-100 rounded-sm p-8 hover:border-black transition-colors space-y-3"
          >
            <h2 className="text-xl font-display font-medium tracking-tight group-hover:underline">
              {r.title}
            </h2>
            <p className="text-sm text-neutral-500 font-light line-clamp-3">{r.intro}</p>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              {r.coverage}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
