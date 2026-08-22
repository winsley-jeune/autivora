'use server';

import { cookies } from 'next/headers';
import { addToCart, createCart, getCart, removeFromCart, updateCart } from '@/lib/shopify';

const CART_COOKIE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 10,
};

function cartError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  const message = error.message.trim();
  return message && message.length <= 160 ? message : fallback;
}

function isVariantId(value: string) {
  return /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(value);
}

function isLineId(value: string) {
  return value.startsWith('gid://shopify/CartLine/') && value.length <= 512;
}

export async function getCartAction() {
  try {
    const cartId = (await cookies()).get('cartId')?.value;
    let cart;

    if (cartId) {
      cart = await getCart(cartId);
    }

    if (!cart) {
      cart = await createCart();
      (await cookies()).set('cartId', cart.id, CART_COOKIE);
    }

    return cart;
  } catch {
    return null;
  }
}

export async function addToCartAction(merchandiseId: string, quantity: number, sellingPlanId?: string) {
  return addCartLinesAction([{ merchandiseId, quantity, sellingPlanId }]);
}

export async function addCartLinesAction(lines: { merchandiseId: string; quantity: number; sellingPlanId?: string }[]) {
  if (!lines.length) return 'No items selected';
  if (lines.length > 25) return 'Too many items were submitted at once.';
  if (lines.some((line) => !isVariantId(line.merchandiseId) || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99)) {
    return 'One or more cart items are invalid.';
  }
  const cartId = (await cookies()).get('cartId')?.value;
  let cart;

  if (cartId) {
    cart = await getCart(cartId);
  }

  if (!cart) {
    cart = await createCart();
    (await cookies()).set('cartId', cart.id, CART_COOKIE);
  }

  try {
    const newCart = await addToCart(cart.id, lines);
    return newCart;
  } catch (error) {
    return cartError(error, 'Unable to add this item. Please try again.');
  }
}

export async function removeFromCartAction(lineId: string) {
  if (!isLineId(lineId)) return 'Invalid cart line.';
  const cartId = (await cookies()).get('cartId')?.value;

  if (!cartId) {
    return 'Missing cart ID';
  }

  try {
    const newCart = await removeFromCart(cartId, [lineId]);
    return newCart;
  } catch (error) {
    return cartError(error, 'Unable to remove this item. Please try again.');
  }
}

export async function updateCartAction(lineId: string, merchandiseId: string, quantity: number) {
  if (!isLineId(lineId) || !isVariantId(merchandiseId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return 'Invalid cart update.';
  }
  const cartId = (await cookies()).get('cartId')?.value;

  if (!cartId) {
    return 'Missing cart ID';
  }

  try {
    const newCart = await updateCart(cartId, [
      {
        id: lineId,
        merchandiseId,
        quantity,
      },
    ]);
    return newCart;
  } catch (error) {
    return cartError(error, 'Unable to update this item. Please try again.');
  }
}
