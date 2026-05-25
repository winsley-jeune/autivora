/**
 * Shopify Selling Plan configuration for oil subscriptions.
 *
 * SETUP REQUIRED IN SHOPIFY:
 * 1. Install "Shopify Subscriptions" (free, native) from the App Store
 * 2. Go to Apps → Subscriptions → Create subscription plan
 * 3. Add 3 delivery options: every 30 / 60 / 90 days with 10% discount
 * 4. Apply the plan to your 3 oil products
 * 5. Paste each selling plan GID below (found in Shopify Admin URL or via API)
 *
 * Selling plan GIDs look like: gid://shopify/SellingPlan/1234567890
 */

export type SubscriptionInterval = {
  label: string;
  days: number;
  sellingPlanId: string | undefined;
};

export const SUBSCRIPTION_INTERVALS: SubscriptionInterval[] = [
  { label: 'Every 30 days', days: 30, sellingPlanId: undefined },
  { label: 'Every 60 days', days: 60, sellingPlanId: undefined },
  { label: 'Every 90 days', days: 90, sellingPlanId: undefined },
];

export const SUBSCRIPTION_DISCOUNT_PERCENT = 10;

/** Returns true when at least one selling plan ID has been configured */
export const subscriptionsEnabled = SUBSCRIPTION_INTERVALS.some((i) => i.sellingPlanId);
