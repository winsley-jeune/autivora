import Image from 'next/image';
import Link from 'next/link';
import QuickAddButton from '@/components/cart/QuickAddButton';
import { brandName } from '@/lib/brand';

// Canonical product card — one consistent look across the whole site
// (category grids, recommendations, /scents, /collection).
type Props = {
  handle: string;
  title: string;
  price: string; // amount, e.g. "59.00"
  currencyCode?: string;
  image?: string;
  secondaryImage?: string; // optional: crossfades in on hover
  variantId?: string | null; // optional: enables hover Quick Add
};

export default function ProductCard({
  handle,
  title,
  price,
  currencyCode = 'USD',
  image,
  secondaryImage,
  variantId,
}: Props) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(price));
  const displayTitle = brandName(title);

  return (
    <article className="group block space-y-3">
      <div className="relative w-full aspect-square bg-neutral-50 rounded-sm overflow-hidden">
        <Link href={`/product/${handle}`} aria-label={`View ${displayTitle}`} className="absolute inset-0 block">
        {image ? (
          <>
            <Image
              src={image}
              alt={displayTitle}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-[opacity,transform] duration-500 ${
                secondaryImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'
              }`}
            />
            {secondaryImage && (
              <Image
                src={secondaryImage}
                alt={displayTitle}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300">
            Autivara
          </div>
        )}
        </Link>

        {variantId && (
          <div className="absolute bottom-0 inset-x-0 z-10 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 md:group-focus-within:translate-y-0 transition-transform duration-300 ease-out">
            <QuickAddButton variantId={variantId} />
          </div>
        )}
      </div>

      <Link href={`/product/${handle}`} className="flex justify-between items-start gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4">
        <h3 className="text-sm font-medium tracking-tight group-hover:text-neutral-500 transition-colors">
          {displayTitle}
        </h3>
        <span className="text-sm font-light text-neutral-900 flex-shrink-0">{formatted}</span>
      </Link>
    </article>
  );
}
