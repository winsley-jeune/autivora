'use client';

import { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/components/cart/cart-context';

type Props = {
  variantId: string;
};

export default function QuickAddButton({ variantId }: Props) {
  const { addCartItem } = useCart();
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state !== 'idle') return;
    setState('loading');
    await addCartItem(variantId, 1);
    setState('done');
    setTimeout(() => setState('idle'), 1800);
  };

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className="w-full py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-60"
    >
      {state === 'done' ? (
        <>
          <Check size={12} strokeWidth={2.5} />
          Added
        </>
      ) : state === 'loading' ? (
        'Adding...'
      ) : (
        <>
          <ShoppingBag size={12} />
          Add to Cart
        </>
      )}
    </button>
  );
}
