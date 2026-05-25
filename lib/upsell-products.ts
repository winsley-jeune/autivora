/**
 * Signature oil upsell configuration.
 * `productId` is the Shopify product GID (gid://shopify/Product/...).
 * Real name, image, price, and variant ID are fetched from Shopify at render time.
 * `notes` and `description` are curated marketing copy shown in the modal.
 */

export type UpsellOil = {
  id: string;          // internal key used for selection state
  notes: string;       // short scent descriptor shown under name
  description: string; // one-line pairing note shown in card
  productId: string;   // Shopify product GID
};

/** Merged type after enriching with live Shopify data */
export type OilCard = {
  id: string;
  variantId: string;   // default variant GID — used to add to cart
  name: string;        // Shopify product title
  notes: string;
  description: string;
  price: string;       // formatted price from Shopify
  image?: string;      // Shopify featuredImage url
};

export const SIGNATURE_OILS: UpsellOil[] = [
  {
    id: 'savage',
    notes: 'Warm · Woody · Sensual',
    description: 'Rich and resinous — ideal for leather and Alcantara interiors.',
    productId: 'gid://shopify/Product/7306062987344',
  },
  {
    id: 'compassion',
    notes: 'Fresh · Citrus · Opulent',
    description: 'Crisp and balanced — a refined presence for every journey.',
    productId: 'gid://shopify/Product/7306062954576',
  },
  {
    id: 'vanilla-macadamia',
    notes: 'Soft · Sweet · Enveloping',
    description: 'Warm vanilla and rich macadamia — comfort for the discerning cabin.',
    productId: 'gid://shopify/Product/7306062856272',
  },
];
