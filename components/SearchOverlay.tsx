'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X } from 'lucide-react';

type ProductHit = {
  handle: string;
  title: string;
  price: string;
  currencyCode: string;
  image: string | null;
};
type ArticleHit = { slug: string; title: string; category: string };
type Results = { products: ProductHit[]; articles: ArticleHit[] };

function fmt(amount: string, currency: string) {
  const n = parseFloat(amount);
  if (Number.isNaN(n)) return '';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Results>({ products: [], articles: [] });
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false); // drives the slide-in transition
  const inputRef = useRef<HTMLInputElement>(null);

  // Mount → animate in, lock scroll, focus the field, wire Escape.
  useEffect(() => {
    if (!open) return;
    setShown(false);
    const raf = requestAnimationFrame(() => setShown(true));
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Reset query each time the overlay opens.
  useEffect(() => {
    if (open) {
      setQ('');
      setResults({ products: [], articles: [] });
    }
  }, [open]);

  // Debounced live search.
  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (!term) {
      setResults({ products: [], articles: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const id = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d: Results) => setResults(d))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [q, open]);

  if (!open) return null;

  const term = q.trim();
  const hasResults = results.products.length > 0 || results.articles.length > 0;

  return (
    <div className="fixed inset-0 z-[60]" aria-modal="true" role="dialog">
      {/* Backdrop — page stays visible behind it */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-200 ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel — slides down from the header, centered */}
      <div
        className={`absolute left-1/2 top-[88px] w-[92%] max-w-2xl -translate-x-1/2 transition-all duration-200 ease-out ${
          shown ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
        }`}
      >
        <div className="bg-white rounded-md shadow-2xl border border-neutral-100 overflow-hidden">
          {/* Input row */}
          <form action="/search" method="get" className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
            <Search size={18} className="text-neutral-400 shrink-0" />
            <input
              ref={inputRef}
              type="search"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search diffusers, scents, guides…"
              aria-label="Search"
              className="flex-1 text-base bg-transparent focus:outline-none placeholder:text-neutral-400"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="p-1 text-neutral-400 hover:text-black transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </form>

          {/* Results */}
          {term && (
            <div className="max-h-[60vh] overflow-y-auto">
              {results.products.length > 0 && (
                <div className="py-2">
                  <p className="px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                    Products
                  </p>
                  {results.products.map((p) => (
                    <Link
                      key={p.handle}
                      href={`/product/${p.handle}`}
                      onClick={onClose}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="relative w-12 h-12 bg-neutral-100 rounded-sm overflow-hidden shrink-0">
                        {p.image && (
                          <Image src={p.image} alt={p.title} fill className="object-cover" sizes="48px" />
                        )}
                      </div>
                      <span className="flex-1 text-sm font-medium tracking-tight">{p.title}</span>
                      <span className="text-sm text-neutral-500 font-light">
                        {fmt(p.price, p.currencyCode)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {results.articles.length > 0 && (
                <div className="py-2 border-t border-neutral-100">
                  <p className="px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                    Guides &amp; Journal
                  </p>
                  {results.articles.map((a) => (
                    <Link
                      key={a.slug}
                      href={`/blog/${a.slug}`}
                      onClick={onClose}
                      className="block px-5 py-3 hover:bg-neutral-50 transition-colors"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mr-2">
                        {a.category}
                      </span>
                      <span className="text-sm font-medium tracking-tight">{a.title}</span>
                    </Link>
                  ))}
                </div>
              )}

              {!loading && !hasResults && (
                <p className="px-5 py-6 text-sm text-neutral-500 font-light">
                  No matches for “{term}”. Press Enter to see all results.
                </p>
              )}

              {loading && !hasResults && (
                <p className="px-5 py-6 text-sm text-neutral-400 font-light">Searching…</p>
              )}

              {hasResults && (
                <Link
                  href={`/search?q=${encodeURIComponent(term)}`}
                  onClick={onClose}
                  className="block px-5 py-4 border-t border-neutral-100 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition-colors"
                >
                  See all results →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
