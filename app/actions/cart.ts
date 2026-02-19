'use server';

import { cookies } from 'next/headers';
import { addToCart, createCart, getCart, removeFromCart, updateCart } from '@/lib/shopify';

export async function getCartAction() {
  try {
    const cartId = (await cookies()).get('cartId')?.value;
    let cart;

    if (cartId) {
      cart = await getCart(cartId);
    }

    if (!cart) {
      cart = await createCart();
      (await cookies()).set('cartId', cart.id);
    }

    return cart;
  } catch {
    return null;
  }
}

export async function addToCartAction(merchandiseId: string, quantity: number, sellingPlanId?: string) {
  const cartId = (await cookies()).get('cartId')?.value;
  let cart;

  if (cartId) {
    cart = await getCart(cartId);
  }

  if (!cart) {
    cart = await createCart();
    (await cookies()).set('cartId', cart.id);
  }

  try {
    const newCart = await addToCart(cart.id, [{ merchandiseId, quantity, sellingPlanId }]);
    return newCart;
  } catch (e) {
    return 'Error adding item to cart';
  }
}

export async function removeFromCartAction(lineId: string) {
  const cartId = (await cookies()).get('cartId')?.value;

  if (!cartId) {
    return 'Missing cart ID';
  }

  try {
    const newCart = await removeFromCart(cartId, [lineId]);
    return newCart;
  } catch (e) {
    return 'Error removing item from cart';
  }
}

export async function updateCartAction(lineId: string, merchandiseId: string, quantity: number) {
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
  } catch (e) {
    return 'Error updating item in cart';
  }
}
