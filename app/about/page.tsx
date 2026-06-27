import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'About Autivara — Design-Led Aroma Diffusers',
  description:
    'Autivara makes design-led aroma diffusers for the car, the home, and business — pieces built to be displayed, with refillable fragrance you own. Here is what we stand for.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Autivara',
    description: 'Design-led aroma diffusers for the car, the home, and business.',
    url: '/about',
    type: 'website',
    images: ['/products/autivora-disco-ball-diffuser/autivora-disco-ball-diffuser-1.jpg'],
  },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' },
        ]}
      />
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">
        <div className="space-y-3 mb-16 border-b border-neutral-100 pb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
            Our Story
          </span>
          <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tighter leading-[1]">
            Scent, designed to be seen.
          </h1>
          <p className="text-sm text-neutral-400 font-light">Excellence in air.</p>
        </div>

        <div className="space-y-12 text-neutral-600 font-light leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">The idea</h2>
            <p>
              Most diffusers are designed to disappear — a plain box you tuck out of sight. We took
              the opposite view. A diffuser sits in your space all day, so it should be something you
              actually want to look at. Autivara pairs a real fragrance oil with a design worth
              displaying: a glowing volcano, a mirror-ball light show, a precision astronaut on the
              dash, a machined metal disc. Function and object, in one.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">What we make</h2>
            <p>
              One considered range across three spaces — the <Link href="/auto" className="underline hover:text-black">car</Link>,
              the <Link href="/home" className="underline hover:text-black">home</Link>, and{' '}
              <Link href="/industrial" className="underline hover:text-black">commercial</Link>{' '}
              settings. Vent clips and rechargeable car diffusers; flame-effect, mist, and
              light-show home pieces; and app-scheduled scent machines for offices, lobbies, and
              venues. Every one is built to be refilled with our line of{' '}
              <Link href="/scents" className="underline hover:text-black">fragrance oils</Link>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">What we stand for</h2>
            <p>
              <strong className="text-black font-medium">You own your scent.</strong> No proprietary
              cartridges, no required subscription. Buy the device once, then refill it with any
              Autivara oil whenever the mood changes.
            </p>
            <p>
              <strong className="text-black font-medium">Design first.</strong> Materials and form
              are chosen to be displayed, not hidden — pieces that earn their place on the dash, the
              shelf, or the counter.
            </p>
            <p>
              <strong className="text-black font-medium">Honest about how it works.</strong> Our car
              diffusers are waterless and refillable; our home pieces use cool ultrasonic mist (no
              heat); our commercial units carry pure fragrance through the space. We describe each
              for exactly what it is.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">Talk to us</h2>
            <p>
              We&apos;re a small team and we answer our own email. Questions about a product, an
              order, or wholesale and custom-branded options — reach us at{' '}
              <a href="mailto:support@autivara.com" className="underline hover:text-black">
                support@autivara.com
              </a>{' '}
              and a real person will reply within one business day.
            </p>
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-neutral-500 transition-colors"
            >
              Explore the Collection <ArrowRight size={14} />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
