# Autivora — Launch Plan: First Sales in 3 Weeks

**Objective:** First real sale within 7 days. 10 orders by end of Week 2. 25–40 orders by end of Week 3.
**Owner:** Winsley. **Created:** 2026-06-07.

> Honest reframe: the "100% SEO, no paid spend" strategy is correct for the *long game* but
> **cannot produce sales in weeks** — SEO takes 3–6 months to rank. To get sales now we lead
> with fast channels (warm network → organic short-form video → community seeding → influencer
> gifting) and let SEO compound in the background. Keep the SEO foundation; change the near-term engine.

---

## Phase 0 — Make the store sale-ready (this week, ~2–3 days)
Driving traffic to a leaky funnel wastes your one launch window. Fix conversion-blockers FIRST.

- [ ] **Place ONE real test order yourself** (real card → refund after). Confirm: payment captures,
      confirmation email arrives, you can fulfill + send tracking. **Single most important validation.**
      If this is broken, nothing else matters.
- [ ] **Fix the PDP pricing** — live page shows `$0.00 / $50.00 / $9.99` fragments instead of a clean
      $149 device + $35 oils. Audit Shopify variant prices + compare-at-price.
- [ ] **Verify pixels actually fire in production** — GA4/Meta/TikTok components exist but use env-var IDs.
      Confirm the IDs are set in Vercel and firing (Meta Pixel Helper + GA realtime). Confirm the
      `ViewContent → AddToCart → InitiateCheckout → Purchase` events all fire.
- [ ] **Remove junk scent** `/scents/page-58a420b90c1ab263` from the catalog.
- [ ] **Add email capture** — popup with 10% off first order (Shopify Email or Klaviyo free tier).
      Most launch traffic won't buy on visit 1 — capture them or lose them.
- [ ] **Trust on the PDP** — 3–5 real seed reviews (early testers/friends), clear shipping & returns,
      payment badges. Cold buyers need proof.

## Phase 1 — Launch week (Week 1): first 5–10 sales from warm + earned reach
**Goal: first sale within 7 days.**

- [ ] **Warm-network blast** — personal 1:1 messages (NOT a mass post) to everyone who'd plausibly want
      this: car people, home/design friends, your network. Founder discount. Target 5 sales from people
      who know you. *This is your historical gap — you build but never do this. Do it.*
- [ ] **Organic short-form video engine** — scent + car aesthetic is made for TikTok / IG Reels / YT Shorts.
      Post 1/day: unboxing, mist in a car interior, "why your car smells," scent reveals. $0, highest ceiling.
      Create @autivora handles today.
- [ ] **Community seeding** — value-first posts in r/cars, r/AutoDetailing, brand-specific subreddits/forums,
      FB car groups. Framing: "I built this — feedback?" not spam.
- [ ] **Influencer gifting** — DM 20–30 micro car/lifestyle creators (5–50k followers); free unit for an
      honest post + UGC you can reuse. Cheap, compounding.

## Phase 2 — Week 2: amplify what moved
- [ ] Identify which Week-1 channel produced sales/engagement → double down, drop the rest.
- [ ] First influencer posts go live → repost UGC, add to PDP.
- [ ] Email automations live: welcome flow + abandoned-cart (Klaviyo free).
- [ ] **Optional tiny paid validation** ($10–15/day) — ONE Meta/TikTok ad against your best UGC video +
      retarget site visitors. Purpose: validate the funnel and feed the pixel, NOT scale. (You said no paid;
      this is optional, but it's the fastest *reliable* sales lever once the pixel has data.)

## Phase 3 — Week 3: convert + compound
- [ ] Scale the single channel that's working; kill the rest.
- [ ] Collect & showcase real reviews from Week-1 buyers → social-proof flywheel.
- [ ] NOW wire the SEO long game: Search Console verify + submit sitemap (117 URLs live) + Google
      Merchant Center feed. Compounds while fast channels carry near-term sales.

---

## Diagnostic rule
If you drive real traffic in Week 1 and get **zero** sales → it's a **funnel/price/offer** problem,
not a traffic problem. Fix the PDP/offer before buying more traffic.

## What Claude can do in the code right now
- Fix PDP pricing display
- Remove junk scent handle
- Add email-capture popup
- Verify/wire pixel env vars + add missing standard events
- Add seed-reviews + trust badges to PDP
- Search Console verification tag + Merchant Center product feed
