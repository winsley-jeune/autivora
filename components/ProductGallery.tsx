'use client';

import { useState } from 'react';
import type { Image as ShopifyImage } from '@/lib/shopify-types';

// Main image with a left vertical thumbnail strip of the other images.
// Clicking a thumbnail swaps it into the main slot.
export default function ProductGallery({
  images,
  title,
}: {
  images: ShopifyImage[];
  title: string;
}) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-neutral-50 flex items-center justify-center overflow-hidden rounded-sm">
        <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-neutral-300">
          Autivara
        </span>
      </div>
    );
  }

  const main = images[selected] ?? images[0];

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {/* Left: the other images as thumbnails — click to substitute the main */}
      {images.length > 1 && (
        <div className="flex flex-row gap-3 w-full overflow-x-auto pb-1 sm:w-20 sm:flex-col sm:overflow-visible sm:pb-0 shrink-0">
          {images.map((img, i) =>
            (
              <button
                key={img.url}
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`View image ${i + 1} of ${title}`}
                aria-current={i === selected ? 'true' : undefined}
                className={`w-16 sm:w-full shrink-0 aspect-square bg-neutral-50 rounded-sm overflow-hidden border hover:border-black transition-colors cursor-pointer ${i === selected ? 'border-black' : 'border-neutral-200'}`}
              >
                <img
                  src={img.url}
                  alt={img.altText ?? `${title} — view ${i + 1}`}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </button>
            )
          )}
        </div>
      )}

      {/* Right: main image */}
      <div className="relative flex-1 aspect-square bg-neutral-50 flex items-center justify-center overflow-hidden rounded-sm">
        <img
          src={main.url}
          alt={main.altText ?? title}
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </div>
    </div>
  );
}
