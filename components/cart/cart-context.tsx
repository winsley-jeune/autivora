'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addCartLinesAction, getCartAction, removeFromCartAction, updateCartAction } from '@/app/actions/cart';
import { Cart, CartItem } from '@/lib/shopify-types';
import { trackAddToCart, trackRemoveFromCart } from '@/components/analytics/events';
import { categoryFromTags } from '@/lib/category';
import { brandName } from '@/lib/brand';

type CartContextType = {
  cart: Cart | undefined;
  addCartItem: (variantId: string, quantity?: number, sellingPlanId?: string) => Promise<boolean>;
  addCartItems: (items: { variantId: string; quantity?: number; sellingPlanId?: string }[]) => Promise<boolean>;
  updateCartItem: (lineId: string, variantId: string, quantity: number) => Promise<boolean>;
  removeCartItem: (lineId: string) => Promise<boolean>;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
  cartError: string | null;
  clearCartError: () => void;
  isCartMutating: boolean;
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
  const [cartError, setCartError] = useState<string | null>(null);
  const [isCartMutating, setCartMutating] = useState(false);

  useEffect(() => {
    getCartAction()
      .then((cart) => {
        if (cart) setCart(cart);
      })
      .catch(() => {});
  }, []);

  const addCartItems = async (items: { variantId: string; quantity?: number; sellingPlanId?: string }[]) => {
    setCartError(null);
    setCartMutating(true);
    try {
      const res = await addCartLinesAction(items.map((item) => ({
        merchandiseId: item.variantId,
        quantity: item.quantity ?? 1,
        sellingPlanId: item.sellingPlanId,
      })));
      if (typeof res === 'string') throw new Error(res);
      setCart(res);
      setCartOpen(true);

      for (const item of items) {
        const line = lineForVariant(res, item.variantId);
        if (!line) continue;
        const money = line.merchandise.product.priceRange?.minVariantPrice;
        if (!money) continue;
        trackAddToCart({
          id: line.merchandise.product.id,
          name: brandName(line.merchandise.product.title),
          price: parseFloat(line.merchandise.product.priceRange.minVariantPrice.amount),
          currency: line.merchandise.product.priceRange.minVariantPrice.currencyCode,
          quantity: item.quantity ?? 1,
          category: categoryFromTags(line.merchandise.product.tags),
        });
      }
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add this item. Please try again.';
      setCartError(message);
      return false;
    } finally {
      setCartMutating(false);
    }
  };

  const addCartItem = async (variantId: string, quantity = 1, sellingPlanId?: string) => {
    return addCartItems([{ variantId, quantity, sellingPlanId }]);
  };

  const updateCartItem = async (lineId: string, variantId: string, quantity: number) => {
    setCartError(null);
    setCartMutating(true);
    try {
      const res = await updateCartAction(lineId, variantId, quantity);
      if (typeof res === 'string') throw new Error(res);
      setCart(res);
      return true;
    } catch (error) {
      setCartError(error instanceof Error ? error.message : 'Unable to update your cart.');
      return false;
    } finally {
      setCartMutating(false);
    }
  };

  const removeCartItem = async (lineId: string) => {
    const removed = cart ? lineById(cart, lineId) : undefined;
    setCartError(null);
    setCartMutating(true);
    try {
      const res = await removeFromCartAction(lineId);
      if (typeof res === 'string') throw new Error(res);
      setCart(res);

      if (removed) {
        const money = removed.merchandise.product.priceRange?.minVariantPrice;
        if (money) {
          trackRemoveFromCart({
            id: removed.merchandise.product.id,
            name: brandName(removed.merchandise.product.title),
            price: parseFloat(money.amount),
            currency: money.currencyCode,
            quantity: removed.quantity,
            category: categoryFromTags(removed.merchandise.product.tags),
          });
        }
      }
      return true;
    } catch (error) {
      setCartError(error instanceof Error ? error.message : 'Unable to remove this item.');
      return false;
    } finally {
      setCartMutating(false);
    }
  };

  const value = useMemo(
    () => ({
      cart,
      addCartItem,
      addCartItems,
      updateCartItem,
      removeCartItem,
      isCartOpen,
      setCartOpen,
      cartError,
      clearCartError: () => setCartError(null),
      isCartMutating,
    }),
    [cart, isCartOpen, cartError, isCartMutating]
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
