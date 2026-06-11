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
  // ── Fresh ──────────────────────────────────────────────────────────────────
  {
    id: 'coastal-linen',
    notes: 'Sea Salt · White Musk · Cotton',
    description: 'Clean ocean air and crisp linen — the freshest start in the catalog.',
    productId: 'gid://shopify/Product/7370632495184',
  },
  {
    id: 'white-tea-cedar',
    notes: 'White Tea · Cedar · Light Citrus',
    description: 'The hotel-lobby classic — quiet, polished, universally welcome.',
    productId: 'gid://shopify/Product/7370632527952',
  },
  {
    id: 'cloud-cotton',
    notes: 'Fresh Cotton · Aldehydes · Soft Musk',
    description: 'Laundry-day comfort, refined — light, airy, and never sweet.',
    productId: 'gid://shopify/Product/7370632560720',
  },
  {
    id: 'pure-rain',
    notes: 'Ozone · Petrichor · Green Leaves',
    description: 'The crispness after a storm — cool, clean, and quietly green.',
    productId: 'gid://shopify/Product/7370632593488',
  },
  // ── Citrus ─────────────────────────────────────────────────────────────────
  {
    id: 'citrus-bloom',
    notes: 'Bergamot · Neroli · Grapefruit',
    description: 'Bright citrus over white blossom — energy without aggression.',
    productId: 'gid://shopify/Product/7370632626256',
  },
  {
    id: 'amalfi-sun',
    notes: 'Lemon · Mandarin · Sea Breeze',
    description: 'Sun-drenched Mediterranean citrus with a cool coastal finish.',
    productId: 'gid://shopify/Product/7370632659024',
  },
  {
    id: 'yuzu-verbena',
    notes: 'Yuzu · Verbena · Mint',
    description: 'Zesty and cool — the sharpest, most awake scent in the line.',
    productId: 'gid://shopify/Product/7370632691792',
  },
  // ── Woody ──────────────────────────────────────────────────────────────────
  {
    id: 'noir-oud',
    notes: 'Oud · Amber · Leather',
    description: 'Deep and resinous — made for leather interiors and low light.',
    productId: 'gid://shopify/Product/7370632724560',
  },
  {
    id: 'cedar-sage',
    notes: 'Cedarwood · Sage · Vetiver',
    description: 'Grounded and spa-calm — dry woods with a herbal lift.',
    productId: 'gid://shopify/Product/7370632757328',
  },
  {
    id: 'smoked-vetiver',
    notes: 'Vetiver · Smoke · Black Pepper',
    description: 'Bold and smoky with a peppered edge — presence, not perfume.',
    productId: 'gid://shopify/Product/7370632790096',
  },
  {
    id: 'santal-royale',
    notes: 'Sandalwood · Cardamom · Musk',
    description: 'Creamy sandalwood warmed with spice — quietly luxurious.',
    productId: 'gid://shopify/Product/7370632822864',
  },
  // ── Warm ───────────────────────────────────────────────────────────────────
  {
    id: 'amber-vanilla',
    notes: 'Vanilla · Amber · Tonka',
    description: 'Warm vanilla wrapped in amber — comfort with composure.',
    productId: 'gid://shopify/Product/7370632855632',
  },
  {
    id: 'tobacco-caramel',
    notes: 'Tobacco Leaf · Caramel · Vanilla',
    description: 'Sweet smoke and caramel depth — the cocktail-bar signature.',
    productId: 'gid://shopify/Product/7370632888400',
  },
  {
    id: 'cashmere-musk',
    notes: 'Warm Musk · Sandalwood · Vanilla',
    description: 'Soft, skin-close warmth — the scent equivalent of cashmere.',
    productId: 'gid://shopify/Product/7370632921168',
  },
  // ── Floral ─────────────────────────────────────────────────────────────────
  {
    id: 'velvet-rose',
    notes: 'Rose · Peony · Sandalwood',
    description: 'A modern rose — petals over smooth wood, never powdery.',
    productId: 'gid://shopify/Product/7370632953936',
  },
  {
    id: 'jasmine-noir',
    notes: 'Jasmine · Tuberose · Amber',
    description: 'White florals after dark — heady, warm, and confident.',
    productId: 'gid://shopify/Product/7370632986704',
  },
  {
    id: 'peony-petal',
    notes: 'Peony · Lychee · Soft Musk',
    description: 'Light, dewy florals with a hint of fruit — effortlessly pretty.',
    productId: 'gid://shopify/Product/7370633019472',
  },
  // ── Spa ────────────────────────────────────────────────────────────────────
  {
    id: 'eucalyptus-mint',
    notes: 'Eucalyptus · Mint · Spearmint',
    description: 'Cool menthol clarity — the steam-room standard.',
    productId: 'gid://shopify/Product/7370633052240',
  },
  {
    id: 'lavender-haze',
    notes: 'Lavender · Chamomile · Vanilla',
    description: 'Soft lavender rounded with chamomile — calm, made ambient.',
    productId: 'gid://shopify/Product/7370633085008',
  },
  {
    id: 'green-bamboo',
    notes: 'Bamboo · Green Tea · Aloe',
    description: 'Clean green serenity — light, watery, and balanced.',
    productId: 'gid://shopify/Product/7370633117776',
  },
];
