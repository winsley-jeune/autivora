/**
 * Social proof data keyed by Shopify product handle.
 * Update rating, reviewCount, and sold whenever you want.
 */
export type SocialProof = {
  rating: number;    // e.g. 4.9
  reviewCount: number;
  sold: number;
};

const SOCIAL_PROOF: Record<string, SocialProof> = {
  'autivora-one': {
    rating: 4.9,
    reviewCount: 38,
    sold: 214,
  },
};

/** Returns social proof for a handle, or null if not configured. */
export function getSocialProof(handle: string): SocialProof | null {
  return SOCIAL_PROOF[handle] ?? null;
}
