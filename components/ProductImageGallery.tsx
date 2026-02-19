'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Image as ShopifyImage } from '@/lib/shopify-types';

type Props = {
  images: ShopifyImage[];
  title: string;
};

export default function ProductImageGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <div className="w-full aspect-square bg-neutral-100 rounded-sm" />;
  }

  const active = images[activeIndex];
  const thumbnailCols = Math.min(images.length, 5);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main image — always fills 100% of container */}
      <div className="relative w-full aspect-square bg-neutral-50 rounded-sm overflow-hidden">
        <Image
          key={active.url}
          src={active.url}
          alt={active.altText ?? title}
          fill
          className="object-cover animate-in fade-in duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails — only shown when there are multiple images */}
      {images.length > 1 && (
        <div
          className="grid gap-2 w-full"
          style={{ gridTemplateColumns: `repeat(${thumbnailCols}, 1fr)` }}
        >
          {images.slice(0, 5).map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative w-full aspect-square rounded-sm overflow-hidden transition-all duration-200 ${
                i === activeIndex
                  ? 'ring-2 ring-black ring-offset-1'
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? title}
                fill
                className="object-cover"
                sizes={`calc(100vw / ${thumbnailCols})`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
