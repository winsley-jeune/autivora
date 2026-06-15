import Link from 'next/link';
import type { SurfaceEntry } from '@/lib/seo-surfaces';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import FaqJsonLd from '@/components/FaqJsonLd';

type Props = {
  entry: SurfaceEntry;
  categoryLabel: string;
  categoryHref: string;
  surfaceHubLabel: string;
  surfaceHubHref: string;
  productHref?: string;
  productCta?: string;
};

export default function SurfacePage({
  entry,
  categoryLabel,
  categoryHref,
  surfaceHubLabel,
  surfaceHubHref,
  productHref = '/product/autivora-rechargeable-car-diffuser',
  productCta = 'Shop the Device',
}: Props) {
  return (
    <div className="bg-white min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: categoryLabel, url: categoryHref },
          { name: surfaceHubLabel, url: surfaceHubHref },
          { name: entry.title, url: `${surfaceHubHref}/${entry.slug}` },
        ]}
      />
      {entry.faq.length > 0 && <FaqJsonLd items={entry.faq} />}

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 max-w-4xl mx-auto text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-6 block">
          {categoryLabel} · {surfaceHubLabel}
        </span>
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter mb-8 leading-tight">
          {entry.title}
        </h1>
        <p className="text-xl text-neutral-500 font-light max-w-2xl mx-auto leading-relaxed">
          {entry.intro}
        </p>
      </section>

      {/* Pairing + placement */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Scent pairing */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-1 border border-neutral-200 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">
              Recommended Scents
            </div>
            <div className="space-y-4">
              {entry.scentPairings.map((scent) => (
                <Link
                  key={scent}
                  href={`/scents/${scent.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block border-b border-neutral-100 pb-4 hover:border-black transition-colors"
                >
                  <span className="text-2xl font-display font-medium tracking-tight group-hover:underline">
                    {scent}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Placement & intensity */}
          <div className="space-y-6 bg-neutral-50 p-8 rounded-sm">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
              Placement & Intensity
            </h3>
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-widest">Recommended Intensity</h4>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      level <= entry.intensity ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-400'
                    }`}
                  >
                    {level}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-widest">Coverage</h4>
              <p className="text-neutral-600 text-sm">{entry.coverage}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-widest">Considerations</h4>
              <ul className="space-y-2">
                {entry.considerations.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-sm text-neutral-600">
                    <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {entry.faq.length > 0 && (
        <section className="bg-neutral-50 py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-medium tracking-tight text-center mb-12">
              Common Questions
            </h2>
            <div className="space-y-8">
              {entry.faq.map((item, i) => (
                <div key={i} className="border-b border-neutral-200 pb-8 last:border-0">
                  <h3 className="text-base font-bold mb-3">{item.question}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-display font-medium tracking-tight">
            Ready to scent your {entry.title.toLowerCase()}?
          </h2>
          <Link
            href={productHref}
            className="inline-block px-12 py-5 bg-black text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all rounded-sm"
          >
            {productCta}
          </Link>
        </div>
      </section>

      {/* SEO keyword footer */}
      <footer className="bg-neutral-50 py-12 border-t border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 text-[10px] text-neutral-300 uppercase tracking-widest flex flex-wrap justify-center gap-x-8 gap-y-4">
          {entry.keywords.map((k) => (
            <span key={k}>{k}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
