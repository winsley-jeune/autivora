'use client';

import { useState } from 'react';
import { useCart } from './cart-context';

type Props = {
  variantId: string;
  label?: string;
  className?: string;
};

export default function AddToCartButton({ variantId, label = 'Add to Cart', className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { addCartItem } = useCart();

  const handleAddToCart = async () => {
    if (loading) return;
    setLoading(true);
    setError(false);
    try {
      const added = await addCartItem(variantId, 1);
      setError(!added);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className={
        className ??
        'w-full lg:w-max px-16 py-5 bg-black text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all duration-500 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed'
      }
    >
      {loading ? 'Adding...' : error ? 'Try Again' : label}
    </button>
  );
}
