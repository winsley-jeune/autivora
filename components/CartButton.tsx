'use client';

import { useCart } from '@/components/cart/cart-context';

export default function CartButton() {
  const { cart, setCartOpen } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button
      onClick={() => setCartOpen(true)}
      className="text-sm font-medium border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all"
    >
      Cart ({count})
    </button>
  );
}
