/**
 * Social proof data keyed by Shopify product handle.
 * Update rating, reviewCount, and sold whenever you want.
 */
export type SocialProof = {
  rating: number;    // e.g. 4.9
  reviewCount: number;
  sold: number;
};

// Empty until real reviews exist — never hardcode a rating/count/sold figure here.
// This feeds live AggregateRating schema.org markup (components/ProductJsonLd.tsx),
// which Google treats as a factual claim; a fabricated entry is fake-review markup.
const SOCIAL_PROOF: Record<string, SocialProof> = {};

/** Returns social proof for a handle, or null if not configured. */
export function getSocialProof(handle: string): SocialProof | null {
  return SOCIAL_PROOF[handle] ?? null;
}
