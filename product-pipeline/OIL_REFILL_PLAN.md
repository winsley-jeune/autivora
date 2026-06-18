# Autivara Oil-Refill Line & Subscription — the profit engine

The pricing analysis proved it: device margin alone can't fund paid acquisition, and every competitor (Pura, Drift, Aroma360) profits on a **recurring fragrance-oil subscription** — the device is the razor, the oil is the blade. This is how a break-even device sale becomes a profitable customer. The oil catalog already exists; this plan turns it into recurring revenue.

## 1. What already exists (code side — done)
- **20 fragrance oils** in `product-pipeline/catalog.json` (`oil_line`), tag `fragrance-oil`, two sizes: **10ml (car) / 200ml (home & commercial)**.
- **`/scents`** renders them live from Shopify (`fragrance-oil` tag) and each has a `/scents/[handle]` page. Copy is now refill-accurate (no "cold-air nebulization").
- If the 20 oils aren't already live in Shopify, import them via `output/products-shopify.csv` (oils rows) — they import as `fragrance-oil`-tagged products.

## 2. Subscription model (the core — Shopify-admin setup)
Install **Shopify Subscriptions** (free, native) → create one plan applied to all 20 oils:
- **Deliver every 30 / 60 / 90 days**, customer-chosen.
- **Subscriber discount ~15%** (the hook; still high-margin on a ~$2–4 COGS oil).
- "Subscribe & Save" widget on every `/scents/[handle]` and in the cart.

The repo already has `lib/subscription-plans.ts` scaffolding — paste the SellingPlan GIDs Shopify generates after you create the plan, and the subscribe option renders.

**Why it works:** a $19 oil at 15% off = ~$16, COGS ~$3, so each refill nets ~$10–12 at near-zero CAC (existing customer). Three refills a year ≈ **$30–36 recurring profit per device sold** — that's the margin the device sale can't make on its own.

## 3. Device → scent pairing (merchandising)
Pair each device with 2–3 suggested oils on the product page ("Pairs well with") to seed the first oil purchase:
| Device type | Suggested oils |
|---|---|
| Car (Astronaut, Disc, Solar, Riff…) | Citrus Bloom, Yuzu Verbena, Cedar & Sage, Coastal Linen |
| Home flame/mist (Ember, Hearth, Nimbus, Nova…) | Amber Vanilla, Tobacco Caramel, Santal Royale, Smoked Vetiver |
| Home minimal (Grove, Reservoir) | White Tea & Cedar, Cloud Cotton, Lavender Haze, Pure Rain |
| Commercial (Atmos, Plug) | Noir Oud, Cashmere Musk, Jasmine Noir, Green Bamboo |

## 4. Bundles (lift AOV over the $100 free-ship line, dilute CAC)
Create as **fixed bundles** (install **Shopify Bundles**, free, so component inventory deducts correctly):
- **Car Starter** — a car diffuser + 2× 10ml oils → ~$39, "save 15%".
- **Home Starter** — a home diffuser + 2× 200ml oils → ~$69.
- **Commercial Starter** — Atmos Wi-Fi + 3× 200ml oils → ~$179.
Bundles raise the first order over $100 (free shipping triggers) and start the customer with oil on hand — making the subscription the natural next step.

## 5. Launch sequence
1. Confirm the 20 oils are live in Shopify (`/scents` shows them); if not, import the oils CSV.
2. Install **Shopify Subscriptions** → create the 30/60/90-day @ 15% plan → apply to all oils → paste SellingPlan GIDs into `lib/subscription-plans.ts`.
3. Install **Shopify Bundles** → build the 3 starter bundles above.
4. Add the "Pairs well with" oil suggestions to device pages (section 3).
5. Post-purchase: email flow (Klaviyo free) prompting a refill subscription ~3 weeks after a device order.

## 6. Pricing note
Current oils at **$19 (10ml) / $39 (200ml)** sit right for the category and leave strong refill margin. Keep them here — the subscription discount, not a lower list price, is the conversion lever.
