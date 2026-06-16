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
    <div className="flex gap-4">
      {/* Left: the other images as thumbnails — click to substitute the main */}
      {images.length > 1 && (
        <div className="flex flex-col gap-3 w-16 sm:w-20 shrink-0">
          {images.map((img, i) =>
            i === selected ? null : (
              <button
                key={img.url}
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`View image ${i + 1} of ${title}`}
                className="aspect-square bg-neutral-50 rounded-sm overflow-hidden border border-neutral-200 hover:border-black transition-colors cursor-pointer"
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
