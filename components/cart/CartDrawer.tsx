'use client';

import { Minus, Plus, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useCart } from './cart-context';
import { trackInitiateCheckout } from '@/components/analytics/events';

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export default function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, removeCartItem, updateCartItem } = useCart();

  const items = cart?.lines.edges ?? [];
  const subtotal = cart?.cost.subtotalAmount;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!isCartOpen}
        onClick={() => setCartOpen(false)}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-neutral-100">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Your Cart</span>
          <button
            onClick={() => setCartOpen(false)}
            className="text-neutral-400 hover:text-black transition-colors"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Line items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-16">
              <p className="text-sm text-neutral-400 font-light">Your cart is empty.</p>
              <button
                onClick={() => setCartOpen(false)}
                className="text-[10px] font-bold uppercase tracking-[0.3em] underline underline-offset-4 hover:text-neutral-500 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(({ node: item }) => (
              <div key={item.id} className="flex gap-4">
                {/* Product image */}
                <div className="relative w-20 h-20 flex-shrink-0 bg-neutral-50 rounded-sm overflow-hidden">
                  {item.merchandise.product.featuredImage?.url ? (
                    <Image
                      src={item.merchandise.product.featuredImage.url}
                      alt={item.merchandise.product.featuredImage.altText ?? item.merchandise.product.title}
                      fill
                      className="object-contain mix-blend-multiply"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs font-medium leading-tight truncate">
                    {item.merchandise.product.title}
                  </p>
                  {item.merchandise.title !== 'Default Title' && (
                    <p className="text-[10px] text-neutral-400">{item.merchandise.title}</p>
                  )}
                  <p className="text-xs font-light text-neutral-500">
                    {formatPrice(item.cost.totalAmount.amount, item.cost.totalAmount.currencyCode)}
                  </p>

                  {/* Quantity stepper + remove */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center border border-neutral-200 rounded-sm">
                      <button
                        onClick={() =>
                          item.quantity === 1
                            ? removeCartItem(item.id)
                            : updateCartItem(item.id, item.merchandise.id, item.quantity - 1)
                        }
                        className="px-2 py-1 hover:bg-neutral-50 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="px-2 text-xs font-light">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateCartItem(item.id, item.merchandise.id, item.quantity + 1)
                        }
                        className="px-2 py-1 hover:bg-neutral-50 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeCartItem(item.id)}
                      className="text-neutral-300 hover:text-red-400 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout footer */}
        {items.length > 0 && subtotal && (
          <div className="px-6 py-5 border-t border-neutral-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                Subtotal
              </span>
              <span className="text-sm font-light">
                {formatPrice(subtotal.amount, subtotal.currencyCode)}
              </span>
            </div>
            <p className="text-[9px] text-neutral-400 font-light">
              Taxes and shipping calculated at checkout.
            </p>
            <a
              href={cart?.checkoutUrl ?? '#'}
              onClick={() => {
                if (!cart) return;
                const value = parseFloat(cart.cost.subtotalAmount.amount);
                const currency = cart.cost.subtotalAmount.currencyCode;
                const itemIds = cart.lines.edges.map((e) => e.node.merchandise.product.id);
                trackInitiateCheckout(value, currency, itemIds);
              }}
              className="block w-full py-4 bg-black text-white text-center text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all duration-300 rounded-sm"
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
