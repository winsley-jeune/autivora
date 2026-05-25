'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addToCartAction, getCartAction, removeFromCartAction, updateCartAction } from '@/app/actions/cart';
import { Cart, CartItem } from '@/lib/shopify-types';
import { trackAddToCart, trackRemoveFromCart } from '@/components/analytics/events';
import { categoryFromTags } from '@/lib/category';

type CartContextType = {
  cart: Cart | undefined;
  addCartItem: (variantId: string, quantity?: number, sellingPlanId?: string) => Promise<string | void>;
  updateCartItem: (lineId: string, variantId: string, quantity: number) => Promise<string | void>;
  removeCartItem: (lineId: string) => Promise<string | void>;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function lineForVariant(cart: Cart, variantId: string): CartItem | undefined {
  return cart.lines.edges.find((e) => e.node.merchandise.id === variantId)?.node;
}

function lineById(cart: Cart, lineId: string): CartItem | undefined {
  return cart.lines.edges.find((e) => e.node.id === lineId)?.node;
}

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

    const line = lineForVariant(res, variantId);
    if (line) {
      trackAddToCart({
        id: line.merchandise.product.id,
        name: line.merchandise.product.title,
        price: parseFloat(line.merchandise.product.priceRange.minVariantPrice.amount),
        currency: line.merchandise.product.priceRange.minVariantPrice.currencyCode,
        quantity,
        category: categoryFromTags(line.merchandise.product.tags),
      });
    }
  };

  const updateCartItem = async (lineId: string, variantId: string, quantity: number) => {
    const res = await updateCartAction(lineId, variantId, quantity);
    if (typeof res === 'string') {
      return res;
    }
    setCart(res);
  };

  const removeCartItem = async (lineId: string) => {
    const removed = cart ? lineById(cart, lineId) : undefined;
    const res = await removeFromCartAction(lineId);
    if (typeof res === 'string') {
      return res;
    }
    setCart(res);

    if (removed) {
      trackRemoveFromCart({
        id: removed.merchandise.product.id,
        name: removed.merchandise.product.title,
        price: parseFloat(removed.merchandise.product.priceRange.minVariantPrice.amount),
        currency: removed.merchandise.product.priceRange.minVariantPrice.currencyCode,
        quantity: removed.quantity,
        category: categoryFromTags(removed.merchandise.product.tags),
      });
    }
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
