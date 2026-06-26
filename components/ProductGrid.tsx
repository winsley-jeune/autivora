import { getProductsByTag } from '@/lib/shopify';
import ProductCard from '@/components/ProductCard';
import { brandName } from '@/lib/brand';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://autivara.com';

// Server component: renders a live product grid for the given tag(s) using the
// canonical ProductCard. Returns null if no products match, so it can be safely
// dropped into any page.
export default async function ProductGrid({
  tags,
  eyebrow,
  heading,
  exclude,
  limit,
  emitItemList, // emit ItemList JSON-LD (use on main category lists, not carousels)
}: {
  tags: string | string[];
  eyebrow?: string;
  heading?: string;
  exclude?: string; // handle to omit (e.g. the current product)
  limit?: number;
  emitItemList?: boolean;
}) {
  let products = await getProductsByTag(tags).catch(() => []);
  if (exclude) products = products.filter((p) => p.handle !== exclude);
  if (limit) products = products.slice(0, limit);
  if (!products.length) return null;

  const itemListSchema = emitItemList
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: products.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${BASE_URL}/product/${p.handle}`,
          name: brandName(p.title),
        })),
      }
    : null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
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
        {products.map((p) => (
          <ProductCard
            key={p.handle}
            handle={p.handle}
            title={p.title}
            price={p.price}
            currencyCode={p.currencyCode}
            image={p.image}
            secondaryImage={p.secondaryImage}
            variantId={p.variantId}
          />
        ))}
      </div>
    </section>
  );
}
