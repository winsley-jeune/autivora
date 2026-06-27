import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Autivara collects, uses, and protects your information when you browse our store and place an order.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">
        <div className="space-y-3 mb-16 border-b border-neutral-100 pb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
            Legal
          </span>
          <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tighter leading-[1]">
            Privacy Policy
          </h1>
          <p className="text-sm text-neutral-400 font-light">Last updated June 2026.</p>
        </div>

        <div className="space-y-10 text-neutral-600 font-light leading-relaxed">
          <section className="space-y-3">
            <p>
              This policy explains what information Autivara (&quot;we&quot;) collects when you visit
              autivara.com or place an order, how we use it, and the choices you have.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              What we collect
            </h2>
            <p>
              <strong className="text-black font-medium">Order information.</strong> When you buy, we
              collect your name, shipping and billing address, email, and order details. Payment is
              processed by our checkout provider (Shopify) — we never see or store your full card
              number.
            </p>
            <p>
              <strong className="text-black font-medium">Usage information.</strong> Like most
              sites, we collect basic analytics — pages viewed, device and browser type, and referring
              source — to understand what is useful and improve the store.
            </p>
            <p>
              <strong className="text-black font-medium">Messages.</strong> If you email us, we keep
              that correspondence so we can help you and follow up.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              How we use it
            </h2>
            <p>
              To process and ship your orders, provide support, send order and account updates, and —
              if you opt in — occasional product news. We use analytics to improve the site. We do not
              sell your personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Service providers
            </h2>
            <p>
              We rely on trusted providers to run the store, including Shopify (checkout and payments),
              our shipping carriers, and analytics tools. They process your information only to provide
              their service to us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Cookies
            </h2>
            <p>
              We use cookies and similar technologies to keep your cart, run checkout, and measure
              site usage. You can control cookies in your browser settings; blocking some may affect
              how the store works.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">Your choices</h2>
            <p>
              You can ask us to access, correct, or delete the personal information we hold, and you
              can unsubscribe from marketing email at any time using the link in the message or by
              emailing us. Contact{' '}
              <a href="mailto:support@autivara.com" className="underline hover:text-black">
                support@autivara.com
              </a>{' '}
              for any privacy request.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">Contact</h2>
            <p>
              Questions about this policy? Email{' '}
              <a href="mailto:support@autivara.com" className="underline hover:text-black">
                support@autivara.com
              </a>{' '}
              or visit our{' '}
              <Link href="/contact" className="underline hover:text-black">
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
