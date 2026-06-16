import Link from 'next/link';
import Image from 'next/image';
import { getProductsByTag } from '@/lib/shopify';

// Server component: renders a live product grid for the given tag(s).
// Returns null if no products match, so it can be safely dropped into any page.
export default async function ProductGrid({
  tags,
  eyebrow,
  heading,
  exclude,
  limit,
}: {
  tags: string | string[];
  eyebrow?: string;
  heading?: string;
  exclude?: string; // handle to omit (e.g. the current product)
  limit?: number;
}) {
  let products = await getProductsByTag(tags).catch(() => []);
  if (exclude) products = products.filter((p) => p.handle !== exclude);
  if (limit) products = products.slice(0, limit);
  if (!products.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      {(eyebrow || heading) && (
        <div className="mb-12 text-center">
          {eyebrow && (
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-4 block">
              {eyebrow}
            </span>
          )}
          {heading && (
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter">{heading}</h2>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p) => {
          const price = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: p.currencyCode || 'USD',
          }).format(parseFloat(p.price));
          const name = p.title.split('—')[0].trim();
          return (
            <Link
              key={p.handle}
              href={`/product/${p.handle}`}
              className="group block space-y-4 border border-neutral-100 rounded-sm p-6 hover:border-black transition-colors"
            >
              <div className="relative aspect-square bg-neutral-50 rounded-sm overflow-hidden">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={name}
                    fill
                    className="object-contain mix-blend-multiply p-6"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-neutral-300">
                    Autivora
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-display font-medium tracking-tight group-hover:underline">
                  {name}
                </h3>
                <p className="text-sm font-medium text-neutral-900">From {price}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
