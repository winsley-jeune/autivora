import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  description: 'Autivora 30-day return policy — hassle-free returns and refunds.',
  alternates: { canonical: '/returns' },
  openGraph: {
    title: 'Returns & Refunds — Autivora',
    description: 'Autivora 30-day return policy.',
    url: '/returns',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function ReturnsPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">

        {/* Header */}
        <div className="space-y-3 mb-16 border-b border-neutral-100 pb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
            Legal
          </span>
          <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tighter leading-[1]">
            Returns & Refunds
          </h1>
          <p className="text-sm text-neutral-400 font-light">Last updated January 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-12 text-neutral-600 font-light leading-relaxed">

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              30-Day Return Guarantee
            </h2>
            <p>
              We stand behind the quality of every Autivora product. If you are not completely
              satisfied with your purchase, you may return it within{' '}
              <strong className="text-black font-medium">30 days of delivery</strong> for a full
              refund, no questions asked.
            </p>
            <p>
              Items must be returned in their original packaging and in the same condition in which
              they were received. Fragrance oils that have been opened are non-refundable for
              hygiene reasons.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              How to Initiate a Return
            </h2>
            <ol className="space-y-4 list-none">
              {[
                {
                  step: '01',
                  text: 'Email us at support@autivora.com with your order number and the reason for your return.',
                },
                {
                  step: '02',
                  text: 'We will respond within 1 business day with a prepaid return label (US orders) or return instructions (international orders).',
                },
                {
                  step: '03',
                  text: 'Pack the item securely in its original packaging and attach the return label.',
                },
                {
                  step: '04',
                  text: 'Drop it off at any authorized carrier location. Your refund will be processed within 3–5 business days of us receiving the return.',
                },
              ].map(({ step, text }) => (
                <li key={step} className="flex gap-5">
                  <span className="text-[10px] font-bold text-neutral-300 tracking-widest pt-0.5 flex-shrink-0">
                    {step}
                  </span>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Refund Timeline
            </h2>
            <div className="border border-neutral-100 rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Stage</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Timeframe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="px-5 py-4">Return label issued</td>
                    <td className="px-5 py-4">Within 1 business day</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4">Refund processed (on receipt)</td>
                    <td className="px-5 py-4">3–5 business days</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4">Credit appears on statement</td>
                    <td className="px-5 py-4">5–10 business days (bank dependent)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm">
              Refunds are issued to the original payment method. We do not charge any restocking fees.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Exchanges
            </h2>
            <p>
              We do not process direct exchanges. If you would like a different item, please return
              your original purchase for a full refund and place a new order. This ensures the
              fastest possible turnaround.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Faulty or Incorrect Items
            </h2>
            <p>
              If you receive a product that is defective or not what you ordered, please contact us
              at{' '}
              <a href="mailto:support@autivora.com" className="text-black underline underline-offset-2">
                support@autivora.com
              </a>{' '}
              within 7 days of delivery. We will arrange a replacement or full refund, including
              return shipping costs, at no charge to you.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Non-Returnable Items
            </h2>
            <ul className="space-y-2 text-sm">
              {[
                'Opened fragrance oils (20ml refills)',
                'Items returned after 30 days from delivery',
                'Items not in their original condition or packaging',
                'Gift cards',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="w-1 h-1 rounded-full bg-neutral-300 flex-shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Contact Us
            </h2>
            <p>
              For any questions about your return or refund, our team is available Monday through
              Friday, 9:00 AM – 6:00 PM GMT.
            </p>
            <a
              href="mailto:support@autivora.com"
              className="inline-block text-[11px] font-bold uppercase tracking-[0.3em] border border-black px-8 py-4 hover:bg-black hover:text-white transition-colors duration-300 rounded-sm"
            >
              Contact Support
            </a>
          </section>

        </div>
      </div>
    </div>
  );
}
