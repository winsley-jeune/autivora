# Autivora — Import & Go-Live Checklist (to first sale)

Goal: get ONE real product live and take a real order. Catalog expansion comes after.

---

## Phase A — Shopify import (30 min)
1. **Back up current state:** Shopify admin → Products → note the test products to delete later
   (Compassion, Savage, Vanilla Macadamia + any test devices).
2. **Import the catalog:** Products → Import → upload `product-pipeline/output/products-shopify.csv`.
   - Leave "Overwrite products with matching handles" **unchecked** (these are new handles).
   - Import runs; all products land as **Draft** (intended).
3. **Create the 6 collections as Automated (smart) collections** — Products → Collections → Create:
   | Collection | Condition (auto) |
   |---|---|
   | Car Diffusers | Product tag is equal to `car-diffusers` |
   | Home Diffusers | Product tag is equal to `home-diffusers` |
   | Commercial & Industrial | Product tag is equal to `commercial-industrial` |
   | Fragrance Oils | Product tag is equal to `fragrance-oils` |
   | Car Accessories | Product tag is equal to `car-accessories` |
   | Autivora for Business | Product tag is equal to `business` |
   (Tags are already in the CSV, so products auto-populate.)

## Phase B — Make ONE product sellable (the unit you have)
4. Open the product you have units of. Set:
   - **Real photos** (your own — not supplier/competitor shots)
   - **Inventory quantity** = units on hand; **Track quantity** = on
   - **Price** confirmed; **Status = Active**
5. **Handle alignment (important):** the live site links to `/product/autivora-one` (9 places).
   Either:
   - **(Easiest)** set your real product's handle to `autivora-one` in Shopify → site works instantly, OR
   - Tell me the real handle (e.g. `autivora-drive`) → I update the 9 links in code.

## Phase C — Pre-launch QA (don't skip — this is where sales leak)
6. **Payments:** Settings → Payments → confirm a live provider (Shopify Payments/Stripe) is active.
7. **Shipping:** Settings → Shipping → real rates for your zones (flat rate is fine to start).
8. **Pricing sanity:** open the live PDP, confirm price renders correctly (earlier the site showed
   $0.00/$50 fragments — verify the real product shows the right price).
9. **Analytics/pixels:** confirm GA4 + Meta pixel env vars are set in Vercel and firing
   (Meta Pixel Helper + GA realtime). Without this you're launching blind.

## Phase D — The real test order (the proof)
10. Place a **real order** on your live store with a real card (smallest item).
    Confirm: payment captures → order confirmation email arrives → you can fulfill + send tracking.
    Then refund yourself. **If this works, you are open for business.**

## Phase E — Go live & drive traffic (LAUNCH_PLAN.md Phase 1)
11. Flip the hero product to Active, delete the test products.
12. Warm-network 1:1 messages + 1 short-form video/day. First-sale target: 7 days.

---

### Notes
- Keep the other 27 products as **Draft** until you have photos + sourcing for them. No rush.
- The Business (B2B) products are "request a quote" — they point to `/business` (contact). No checkout
  inventory needed; they're lead-gen.
