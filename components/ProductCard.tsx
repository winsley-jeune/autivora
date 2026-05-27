import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Product } from '@/lib/shopify-types';
import QuickAddButton from '@/components/cart/QuickAddButton';
import { getSocialProof } from '@/lib/product-social-proof';

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.priceRange.minVariantPrice.currencyCode,
  }).format(parseFloat(product.priceRange.minVariantPrice.amount));

  // Build deduped image list (featured first, then gallery)
  const seen = new Set<string>();
  const images: { url: string; altText: string }[] = [];
  for (const img of [
    product.featuredImage,
    ...(product.images?.edges?.map((e) => e.node) ?? []),
  ]) {
    if (img && !seen.has(img.url)) {
      seen.add(img.url);
      images.push({ url: img.url, altText: img.altText ?? product.title });
    }
  }

  const primary = images[0];
  const secondary = images[1];
  const firstVariantId = product.variants?.edges?.[0]?.node?.id ?? null;
  const proof = getSocialProof(product.handle);

  return (
    <Link href={`/product/${product.handle}`} className="group block space-y-4">
      {/* Image container */}
      <div className="relative w-full aspect-square bg-neutral-50 rounded-sm overflow-hidden">
        {primary ? (
          <>
            <Image
              src={primary.url}
              alt={primary.altText}
              fill
              className={`object-cover transition-[opacity,transform] duration-500 ${
                secondary ? 'group-hover:opacity-0' : 'group-hover:scale-105'
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
            {secondary && (
              <Image
                src={secondary.url}
                alt={secondary.altText}
                fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
            <span className="text-neutral-300 text-xs uppercase tracking-widest">No Image</span>
          </div>
        )}

        {/* Quick Add — slides up from bottom on hover */}
        {firstVariantId && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <QuickAddButton variantId={firstVariantId} />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-sm font-medium tracking-tight group-hover:text-neutral-500 transition-colors">
              {product.title}
            </h2>
            {product.description && (
              <p className="text-xs text-neutral-500 font-light line-clamp-2 max-w-xs">
                {product.description}
              </p>
            )}
          </div>
          <span className="text-sm font-light text-neutral-900 flex-shrink-0 ml-4">{price}</span>
        </div>

        {/* Social proof */}
        {proof && (
          <div className="flex items-center gap-3">
            {/* Stars */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={
                    i < Math.floor(proof.rating)
                      ? 'fill-neutral-900 text-neutral-900'
                      : 'fill-neutral-200 text-neutral-200'
                  }
                />
              ))}
              <span className="text-[10px] font-medium text-neutral-700 ml-0.5">
                {proof.rating}
              </span>
              <span className="text-[10px] text-neutral-400 font-light">
                ({proof.reviewCount})
              </span>
            </div>
            <span className="text-neutral-200">·</span>
            {/* Sold count */}
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">
              {proof.sold.toLocaleString()} sold
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
