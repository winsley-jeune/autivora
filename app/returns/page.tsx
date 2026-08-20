import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  description: 'Autivara return eligibility, request process, and refund information.',
  alternates: { canonical: '/returns' },
};

export default function ReturnsPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <div className="max-w-2xl mx-auto px-6 pt-24 md:pt-32 pb-24">
        <header className="space-y-3 mb-14 border-b border-neutral-100 pb-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">Support</span>
          <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tighter">Returns &amp; refunds</h1>
          <p className="text-sm text-neutral-400 font-light">Last updated August 2026</p>
        </header>

        <div className="space-y-10 text-neutral-600 font-light leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-black">Requesting a return</h2>
            <p>Contact <a href="mailto:support@autivara.com" className="text-black underline underline-offset-2">support@autivara.com</a> within 30 days of delivery and include your order number, the item you want to return, its condition, and the reason for the request.</p>
            <p>Do not ship an item back until return instructions and the return address have been provided. Return destinations can vary by product.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-black">Eligibility</h2>
            <p>Items must be unused, undamaged, and returned with their original components and packaging. Used fragrance products, gift cards, final-sale items, and products damaged after delivery are not eligible for a change-of-mind return.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-black">Return shipping</h2>
            <p>Return-shipping responsibility and available labels depend on the reason for the return and the destination. We will explain any applicable cost before authorizing the return. Do not assume a prepaid label is included.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-black">Damaged, defective, or incorrect items</h2>
            <p>Contact us promptly with clear photos or video of the product, packaging, shipping label, and problem. Keep all packaging while the claim is reviewed. The available resolution may include troubleshooting, replacement, return, or refund depending on the verified issue.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-black">Refunds</h2>
            <p>Approved refunds are issued to the original payment method after the returned item or claim is reviewed. Bank and payment-provider processing times vary. Original shipping charges, customs fees, and return costs are not refundable unless required by law or included in the approved resolution.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-black">Your legal rights</h2>
            <p>This policy does not limit any non-waivable consumer rights that apply in your jurisdiction.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
