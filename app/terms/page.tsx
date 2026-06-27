import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms that apply when you browse autivara.com and purchase Autivara aroma diffusers and fragrance oils.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">
        <div className="space-y-3 mb-16 border-b border-neutral-100 pb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
            Legal
          </span>
          <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tighter leading-[1]">
            Terms of Service
          </h1>
          <p className="text-sm text-neutral-400 font-light">Last updated June 2026.</p>
        </div>

        <div className="space-y-10 text-neutral-600 font-light leading-relaxed">
          <section className="space-y-3">
            <p>
              These terms apply when you use autivara.com and purchase from us. By placing an order,
              you agree to them.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Products & pricing
            </h2>
            <p>
              We do our best to describe and picture every product accurately, but colors and finishes
              can vary slightly between screens and units. Prices are shown in your store currency and
              may change; the price at checkout is the price that applies. We may correct obvious
              pricing errors and cancel affected orders with a full refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">Orders</h2>
            <p>
              An order is an offer to buy. We may accept or decline it — for example, if an item is out
              of stock or a payment cannot be verified. If we cannot fulfill an order, we will let you
              know and refund any charge.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Shipping & returns
            </h2>
            <p>
              Shipping timelines and return eligibility are described on our{' '}
              <Link href="/shipping" className="underline hover:text-black">
                shipping
              </Link>{' '}
              and{' '}
              <Link href="/returns" className="underline hover:text-black">
                returns
              </Link>{' '}
              pages, which form part of these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Safe use of products
            </h2>
            <p>
              Our diffusers and fragrance oils are for normal consumer (and, where stated, commercial)
              use. Please follow the fill, power, and placement guidance included with each unit. Keep
              concentrated oils out of reach of children and pets. Autivara is not liable for misuse or
              for use contrary to the included instructions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Intellectual property
            </h2>
            <p>
              The Autivara name, site content, images, and copy are owned by us or our licensors and
              may not be reused without permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Limitation of liability
            </h2>
            <p>
              To the extent permitted by law, our liability for any claim related to a product or this
              site is limited to the amount you paid for the product at issue. Nothing in these terms
              limits rights you have under applicable consumer-protection law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">Contact</h2>
            <p>
              Questions about these terms? Email{' '}
              <a href="mailto:support@autivara.com" className="underline hover:text-black">
                support@autivara.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
