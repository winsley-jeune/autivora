import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Information',
  description: 'How Autivara displays shipping availability, costs, estimates, and tracking.',
  alternates: { canonical: '/shipping' },
};

export default function ShippingPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <div className="max-w-2xl mx-auto px-6 pt-24 md:pt-32 pb-24">
        <header className="space-y-3 mb-14 border-b border-neutral-100 pb-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">Support</span>
          <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tighter">Shipping information</h1>
          <p className="text-sm text-neutral-400 font-light">Last updated August 2026</p>
        </header>

        <div className="space-y-10 text-neutral-600 font-light leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-black">Availability and cost</h2>
            <p>Enter your delivery address at checkout to see the shipping methods, costs, and destinations currently available for your order. If checkout does not offer a method for an address, we cannot accept delivery to that destination.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-black">Processing and delivery estimates</h2>
            <p>Any processing or delivery window shown at checkout is an estimate, not a guaranteed arrival date. Timing can vary by product, destination, carrier, customs processing, severe weather, and other conditions outside our control.</p>
            <p>If timing is important, contact us before ordering and include the product and destination country or postal code.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-black">Tracking</h2>
            <p>When tracking is available, it is sent to the email address used for the order after the carrier accepts the shipment. Carrier scans can take time to appear.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-black">International orders</h2>
            <p>Customers are responsible for any import duties, taxes, brokerage charges, or customs fees assessed by the destination country unless checkout expressly states otherwise.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-black">Problems with a shipment</h2>
            <p>For a damaged, missing, or incorrectly delivered order, email <a href="mailto:support@autivara.com" className="text-black underline underline-offset-2">support@autivara.com</a> with your order number and relevant photos or tracking details. We will review the order and explain the available resolution.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
