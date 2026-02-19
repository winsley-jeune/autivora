'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addToCartAction, getCartAction, removeFromCartAction, updateCartAction } from '@/app/actions/cart';
import { Cart, CartItem } from '@/lib/shopify-types';

type CartContextType = {
  cart: Cart | undefined;
  addCartItem: (variantId: string, quantity?: number, sellingPlanId?: string) => Promise<string | void>;
  updateCartItem: (lineId: string, variantId: string, quantity: number) => Promise<string | void>;
  removeCartItem: (lineId: string) => Promise<string | void>;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | undefined>(undefined);
  const [isCartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    getCartAction()
      .then((cart) => {
        if (cart) setCart(cart);
      })
      .catch(() => {});
  }, []);

  const addCartItem = async (variantId: string, quantity = 1, sellingPlanId?: string) => {
    const res = await addToCartAction(variantId, quantity, sellingPlanId);
    if (typeof res === 'string') {
      return res;
    }
    setCart(res);
    setCartOpen(true);
  };

  const updateCartItem = async (lineId: string, variantId: string, quantity: number) => {
    const res = await updateCartAction(lineId, variantId, quantity);
    if (typeof res === 'string') {
      return res;
    }
    setCart(res);
  };

  const removeCartItem = async (lineId: string) => {
    const res = await removeFromCartAction(lineId);
    if (typeof res === 'string') {
      return res;
    }
    setCart(res);
  };

  const value = useMemo(
    () => ({
      cart,
      addCartItem,
      updateCartItem,
      removeCartItem,
      isCartOpen,
      setCartOpen,
    }),
    [cart, isCartOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
