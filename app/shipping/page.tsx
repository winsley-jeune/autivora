import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'Autivora shipping information — delivery times, carriers, and international orders.',
  alternates: { canonical: '/shipping' },
  openGraph: {
    title: 'Shipping Policy — Autivora',
    description: 'Delivery times, carriers, and international orders.',
    url: '/shipping',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function ShippingPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">

        {/* Header */}
        <div className="space-y-3 mb-16 border-b border-neutral-100 pb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
            Legal
          </span>
          <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tighter leading-[1]">
            Shipping Policy
          </h1>
          <p className="text-sm text-neutral-400 font-light">Last updated January 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-12 text-neutral-600 font-light leading-relaxed">

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Processing Time
            </h2>
            <p>
              All orders are processed within <strong className="text-black font-medium">1 business day</strong> of
              purchase. Orders placed before 12:00 PM (GMT) on a business day ship the same day.
              Orders placed after 12:00 PM or on weekends and public holidays are dispatched the
              following business day.
            </p>
            <p>
              Once your order has been dispatched, you will receive a confirmation email with your
              tracking number.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Domestic Shipping (United States)
            </h2>
            <div className="border border-neutral-100 rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Method</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Delivery</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="px-5 py-4">Standard</td>
                    <td className="px-5 py-4">3–5 business days</td>
                    <td className="px-5 py-4">$8.00</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4">Express</td>
                    <td className="px-5 py-4">1–2 business days</td>
                    <td className="px-5 py-4">$18.00</td>
                  </tr>
                  <tr className="bg-neutral-50">
                    <td className="px-5 py-4 font-medium text-black">Free Shipping</td>
                    <td className="px-5 py-4">3–5 business days</td>
                    <td className="px-5 py-4 font-medium text-black">Orders over $100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              International Shipping
            </h2>
            <p>
              Autivora ships to over 40 countries worldwide. International orders are shipped via
              DHL Express or your local postal carrier depending on the destination.
            </p>
            <div className="border border-neutral-100 rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Region</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Delivery</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="px-5 py-4">Europe</td>
                    <td className="px-5 py-4">4–7 business days</td>
                    <td className="px-5 py-4">$22.00</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4">Canada & Mexico</td>
                    <td className="px-5 py-4">3–6 business days</td>
                    <td className="px-5 py-4">$18.00</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4">Middle East & Asia</td>
                    <td className="px-5 py-4">5–10 business days</td>
                    <td className="px-5 py-4">$28.00</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4">Rest of World</td>
                    <td className="px-5 py-4">7–14 business days</td>
                    <td className="px-5 py-4">$32.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm">
              Import duties, taxes, and customs fees are the responsibility of the customer and are
              not included in the order total. These charges vary by country and are collected by
              your local customs authority.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Order Tracking
            </h2>
            <p>
              Every order ships with full tracking. Once dispatched, a tracking link will be sent
              to your email address. For DHL Express international shipments, tracking updates
              in real time from the moment your parcel leaves our facility.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              Damaged or Lost Shipments
            </h2>
            <p>
              In the unlikely event that your order arrives damaged or is lost in transit, please
              contact us at{' '}
              <a href="mailto:support@autivora.com" className="text-black underline underline-offset-2">
                support@autivora.com
              </a>{' '}
              within 7 days of the estimated delivery date. We will arrange a replacement or full
              refund at no additional cost.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
