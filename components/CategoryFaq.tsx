import FaqJsonLd from './FaqJsonLd';

type FaqItem = { question: string; answer: string };

/**
 * Visible category-level FAQ block + FAQPage JSON-LD.
 * Adds indexable, long-tail copy to otherwise thin category pages and
 * makes them eligible for FAQ rich results.
 */
export default function CategoryFaq({
  heading = 'Common questions',
  items,
}: {
  heading?: string;
  items: FaqItem[];
}) {
  if (!items.length) return null;
  return (
    <section className="py-24 px-6 border-t border-neutral-100">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="space-y-3 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            Good to know
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight">{heading}</h2>
        </div>
        <div className="space-y-8">
          {items.map((item) => (
            <div key={item.question} className="space-y-2 border-b border-neutral-100 pb-8 last:border-0">
              <h3 className="text-lg font-display font-medium tracking-tight text-black">
                {item.question}
              </h3>
              <p className="text-neutral-600 font-light leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
      <FaqJsonLd items={items} />
    </section>
  );
}
