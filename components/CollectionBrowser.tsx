'use client';

import { useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';

export type CollectionItem = {
  id: string;
  handle: string;
  title: string;
  price: string;
  currencyCode: string;
  image?: string;
  secondaryImage?: string;
  variantId?: string;
  category: 'Car' | 'Home' | 'Commercial' | 'Other';
};

const FILTERS = ['All', 'Car', 'Home', 'Commercial'] as const;

export default function CollectionBrowser({ products }: { products: CollectionItem[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [sort, setSort] = useState('featured');

  const visible = useMemo(() => {
    const selected = filter === 'All' ? products : products.filter((product) => product.category === filter);
    return [...selected].sort((a, b) => {
      if (sort === 'price-asc') return Number(a.price) - Number(b.price);
      if (sort === 'price-desc') return Number(b.price) - Number(a.price);
      if (sort === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [filter, products, sort]);

  return (
    <section aria-labelledby="available-diffusers" className="max-w-7xl mx-auto px-5 sm:px-6 pt-16 md:pt-20 pb-16">
      <div className="flex flex-col gap-6 border-b border-neutral-100 pb-6 mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-2">Shop the collection</p>
          <h2 id="available-diffusers" className="text-3xl font-display font-bold tracking-tight">Available diffusers</h2>
          <p aria-live="polite" className="mt-2 text-sm text-neutral-500">{visible.length} product{visible.length === 1 ? '' : 's'}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <fieldset>
            <legend className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Filter by space</legend>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={filter === option}
                  onClick={() => setFilter(option)}
                  className={`min-h-11 rounded-sm border px-4 py-2 text-xs font-medium transition-colors ${filter === option ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-black'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Sort
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="mt-2 block min-h-11 w-full rounded-sm border border-neutral-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-black focus:border-black sm:w-44"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="title">Name: A–Z</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
        {visible.map((product) => <ProductCard key={product.id} {...product} />)}
      </div>
    </section>
  );
}
