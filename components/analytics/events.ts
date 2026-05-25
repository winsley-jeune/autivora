'use client';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
      load: (id: string, opts?: Record<string, unknown>) => void;
    };
    pintrk?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type ProductPayload = {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity?: number;
  category?: string;
};

const totalValue = (p: ProductPayload) => p.price * (p.quantity ?? 1);

export function trackViewContent(p: ProductPayload) {
  if (typeof window === 'undefined') return;
  const value = totalValue(p);
  window.gtag?.('event', 'view_item', {
    currency: p.currency,
    value,
    items: [{ item_id: p.id, item_name: p.name, item_category: p.category, price: p.price, quantity: p.quantity ?? 1 }],
  });
  window.fbq?.('track', 'ViewContent', {
    content_ids: [p.id],
    content_name: p.name,
    content_type: 'product',
    content_category: p.category,
    currency: p.currency,
    value,
  });
  window.ttq?.track('ViewContent', {
    contents: [{ content_id: p.id, content_name: p.name, content_category: p.category, price: p.price, quantity: p.quantity ?? 1 }],
    value,
    currency: p.currency,
  });
  window.pintrk?.('track', 'pagevisit', { product_id: p.id, product_name: p.name, value, currency: p.currency });
}

export function trackAddToCart(p: ProductPayload) {
  if (typeof window === 'undefined') return;
  const value = totalValue(p);
  window.gtag?.('event', 'add_to_cart', {
    currency: p.currency,
    value,
    items: [{ item_id: p.id, item_name: p.name, item_category: p.category, price: p.price, quantity: p.quantity ?? 1 }],
  });
  window.fbq?.('track', 'AddToCart', {
    content_ids: [p.id],
    content_name: p.name,
    content_type: 'product',
    content_category: p.category,
    currency: p.currency,
    value,
  });
  window.ttq?.track('AddToCart', {
    contents: [{ content_id: p.id, content_name: p.name, content_category: p.category, price: p.price, quantity: p.quantity ?? 1 }],
    value,
    currency: p.currency,
  });
  window.pintrk?.('track', 'addtocart', { product_id: p.id, product_name: p.name, value, currency: p.currency });
}

export function trackRemoveFromCart(p: ProductPayload) {
  if (typeof window === 'undefined') return;
  const value = totalValue(p);
  window.gtag?.('event', 'remove_from_cart', {
    currency: p.currency,
    value,
    items: [{ item_id: p.id, item_name: p.name, price: p.price, quantity: p.quantity ?? 1 }],
  });
}

export function trackInitiateCheckout(value: number, currency: string, itemIds: string[]) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', 'begin_checkout', { currency, value, items: itemIds.map((id) => ({ item_id: id })) });
  window.fbq?.('track', 'InitiateCheckout', { currency, value, content_ids: itemIds, content_type: 'product' });
  window.ttq?.track('InitiateCheckout', { value, currency, contents: itemIds.map((id) => ({ content_id: id })) });
  window.pintrk?.('track', 'checkout', { value, currency, line_items: itemIds.map((id) => ({ product_id: id })) });
}

export function trackPageView(path?: string) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', 'page_view', { page_path: path ?? window.location.pathname });
  window.fbq?.('track', 'PageView');
  window.ttq?.page();
  window.pintrk?.('track', 'pagevisit');
}

export function trackLead(value?: number, currency = 'USD') {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', 'generate_lead', { value, currency });
  window.fbq?.('track', 'Lead', { value, currency });
  window.ttq?.track('SubmitForm');
  window.pintrk?.('track', 'lead', { value, currency });
}
