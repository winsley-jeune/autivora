import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Reach the Autivara team — order questions, product support, wholesale and B2B inquiries. We respond within 1 business day.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us — Autivara',
    description: 'Order questions, product support, wholesale and B2B inquiries.',
    url: '/contact',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">

        {/* Header */}
        <div className="space-y-3 mb-16 border-b border-neutral-100 pb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
            Support
          </span>
          <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tighter leading-[1]">
            Contact Us
          </h1>
          <p className="text-sm text-neutral-400 font-light">
            We respond to every message within 1 business day.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 text-neutral-600 font-light leading-relaxed">

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Orders & Product Support
            </h2>
            <p>
              Questions about an order, shipping, a return, or getting the most out of your
              Autivara diffuser — email us and a real person will get back to you within one
              business day, Monday through Friday, 9:00 AM – 6:00 PM GMT.
            </p>
            <a
              href="mailto:support@autivara.com"
              className="inline-block text-[11px] font-bold uppercase tracking-[0.3em] border border-black px-8 py-4 hover:bg-black hover:text-white transition-colors duration-300 rounded-sm"
            >
              support@autivara.com
            </a>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Wholesale & B2B
            </h2>
            <p>
              Detailing studios, salons, gyms, hotels, and retailers — we offer wholesale pricing
              on devices and oils. Tell us about your space and volume, and we&apos;ll send a
              wholesale price list the same day.
            </p>
            <a
              href="mailto:support@autivara.com?subject=Wholesale%20Inquiry"
              className="text-black underline underline-offset-2"
            >
              support@autivara.com — subject: Wholesale Inquiry
            </a>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Before You Write
            </h2>
            <p>The answer might already be here:</p>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Shipping times and tracking', href: '/shipping' },
                { label: '30-day returns and refunds', href: '/returns' },
                { label: 'Which device fits your space', href: '/collection' },
              ].map(({ label, href }) => (
                <li key={href} className="flex items-start gap-3">
                  <span className="w-1 h-1 rounded-full bg-neutral-300 flex-shrink-0 mt-2" />
                  <Link href={href} className="text-black underline underline-offset-2">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
