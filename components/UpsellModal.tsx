'use client';

import { useState } from 'react';
import { Check, X, RefreshCw } from 'lucide-react';
import { useCart } from '@/components/cart/cart-context';
import type { OilCard } from '@/lib/upsell-products';
import {
  SUBSCRIPTION_INTERVALS,
  SUBSCRIPTION_DISCOUNT_PERCENT,
  subscriptionsEnabled,
} from '@/lib/subscription-plans';

type Props = {
  variantId: string;
  oils: OilCard[];
  label?: string;
  className?: string;
};

function discountedPrice(price: string, pct: number): string {
  const num = parseFloat(price.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return price;
  const discounted = num * (1 - pct / 100);
  return price.replace(/[\d.]+/, discounted.toFixed(2));
}

export default function UpsellModal({ variantId, oils, label = 'Shop The One', className }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [subscribe, setSubscribe] = useState(false);
  const [intervalIdx, setIntervalIdx] = useState(0);
  const { addCartItem, setCartOpen } = useCart();

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeInterval = SUBSCRIPTION_INTERVALS[intervalIdx];
  const canSubscribe = subscriptionsEnabled;

  const handleConfirm = async (withOils: boolean) => {
    setLoading(true);
    setOpen(false);
    try {
      await addCartItem(variantId, 1);
      if (withOils) {
        const sellingPlanId = subscribe ? activeInterval.sellingPlanId : undefined;
        for (const oil of oils) {
          if (selected.has(oil.id)) {
            await addCartItem(oil.variantId, 1, sellingPlanId);
          }
        }
      }
    } finally {
      setLoading(false);
      setCartOpen(true);
    }
  };

  const anySelected = selected.size > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={loading}
        className={
          className ??
          'w-full lg:w-max px-16 py-5 bg-black text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all duration-500 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed'
        }
      >
        {loading ? 'Adding...' : label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative z-10 bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Header */}
            <div className="flex justify-between items-start px-8 pt-8 pb-6 border-b border-neutral-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-neutral-400">
                  Complete Your Experience
                </p>
                <h2 className="text-2xl font-display font-bold tracking-tight">
                  Add a Signature Oil
                </h2>
                <p className="text-sm text-neutral-400 font-light">
                  20ml · Cold-air compatible · Pairs with your Autivora device
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-neutral-300 hover:text-black transition-colors mt-1" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {/* Subscribe toggle */}
            {canSubscribe && (
              <div className="px-8 py-5 border-b border-neutral-100 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSubscribe(false)}
                    className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] rounded-sm border transition-all duration-200 ${
                      !subscribe
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
                    }`}
                  >
                    One-time
                  </button>
                  <button
                    onClick={() => setSubscribe(true)}
                    className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] rounded-sm border transition-all duration-200 flex items-center justify-center gap-2 ${
                      subscribe
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
                    }`}
                  >
                    <RefreshCw size={10} />
                    Subscribe &amp; Save {SUBSCRIPTION_DISCOUNT_PERCENT}%
                  </button>
                </div>

                {subscribe && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Deliver</span>
                    <div className="flex gap-2">
                      {SUBSCRIPTION_INTERVALS.map((interval, i) => (
                        <button
                          key={interval.days}
                          onClick={() => setIntervalIdx(i)}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-sm border transition-all duration-150 ${
                            intervalIdx === i
                              ? 'border-black bg-black text-white'
                              : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
                          }`}
                        >
                          {interval.days}d
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      — {activeInterval.label.toLowerCase()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Oil cards */}
            <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {oils.map((oil) => {
                const isSelected = selected.has(oil.id);
                const displayPrice = subscribe
                  ? discountedPrice(oil.price, SUBSCRIPTION_DISCOUNT_PERCENT)
                  : oil.price;

                return (
                  <button
                    key={oil.id}
                    onClick={() => toggle(oil.id)}
                    aria-pressed={isSelected}
                    className={`relative text-left rounded-sm transition-all duration-200 overflow-hidden border ${
                      isSelected
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {oil.image && (
                      <div className="aspect-square w-full overflow-hidden bg-neutral-50">
                        <img
                          src={oil.image}
                          alt={oil.name}
                          className={`w-full h-full object-cover transition-opacity duration-200 ${isSelected ? 'opacity-70' : ''}`}
                        />
                      </div>
                    )}

                    <div className="p-4 space-y-2">
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-white/20 rounded-full p-0.5">
                          <Check size={13} strokeWidth={2.5} className="text-white" />
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-black'}`}>
                          {oil.name}
                        </p>
                        <p className={`text-[10px] tracking-wide font-light ${isSelected ? 'text-white/70' : 'text-neutral-400'}`}>
                          {oil.notes}
                        </p>
                      </div>

                      <p className={`text-[11px] font-light leading-relaxed ${isSelected ? 'text-white/80' : 'text-neutral-500'}`}>
                        {oil.description}
                      </p>

                      <div className="flex items-baseline gap-2">
                        <p className={`text-sm font-light ${isSelected ? 'text-white' : 'text-black'}`}>
                          {displayPrice}
                        </p>
                        {subscribe && (
                          <p className={`text-[10px] line-through ${isSelected ? 'text-white/50' : 'text-neutral-300'}`}>
                            {oil.price}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleConfirm(true)}
                disabled={!anySelected}
                className="flex-1 py-4 bg-black text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-colors rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {anySelected
                  ? `Add Diffuser + Oil${selected.size > 1 ? 's' : ''}${subscribe ? ' (Subscribe)' : ''}`
                  : 'Select an Oil'}
              </button>
              <button
                onClick={() => handleConfirm(false)}
                className="flex-1 py-4 border border-neutral-200 text-[11px] font-bold uppercase tracking-[0.3em] hover:border-black transition-colors rounded-sm"
              >
                Just The Diffuser
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
