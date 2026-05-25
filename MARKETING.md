# Autivara — Marketing & Launch Playbook

Living document covering site architecture, tracking infrastructure, SEO strategy, channel setup, and the human action list to take Autivara from "code on disk" to "first paying customer."

**Strategy:** 100% organic + SEO across **four product categories** (Auto · Home · Office · Industrial) plus a **unified Scent catalog**. Ad channels wired but $0 spend until SEO baseline is established. Subscription oil refills drive LTV.

---

## 1. Brand & category architecture

**Brand:** Autivara — "Excellence in Air." Cross-category umbrella covering one core technology (cold-air nebulization) deployed across four distinct categories. Each category gets a purpose-built device.

| Category | URL | Form factor | Target customer |
|---|---|---|---|
| **Auto** | `/auto` | Cup-holder cylinder | Luxury drivers (Porsche, BMW, MB, etc.) |
| **Home** | `/home` | Counter/wall/shelf | Homeowners, design-conscious renters |
| **Office** | `/office` | Desk / multi-unit array | Solo founders, small teams, agencies |
| **Industrial** | `/industrial` | Wall-mount / HVAC | SMB hospitality, retail, real estate, medical |
| **Scents** | `/scents` | Refill catalog | Cross-category — same oils, every device |

All four categories use the same Storefront, Cart, Checkout, and Subscription system. Industrial is DTC (Add-to-Cart) like the others — no Request-a-Quote walls on small properties.

---

## 2. Site architecture

### 2.1 Routes

```
/                                  — multi-category homepage
/auto                              — auto category landing
/fitment                           — auto SEO surface: by vehicle
/fitment/[brand]/[model]           — long-tail: "[Year] [Make] [Model] car diffuser"
/home                              — home category landing
/home/rooms                        — home SEO surface hub
/home/rooms/[room]                 — long-tail: "Diffuser for [room]"
/office                            — office category landing
/office/sizes                      — office SEO surface hub
/office/sizes/[size]               — long-tail: "Diffuser for [size] office"
/industrial                        — industrial category landing
/industrial/use-cases              — industrial SEO surface hub
/industrial/use-cases/[type]       — long-tail: "Diffuser for [use case]"
/scents                            — unified scent catalog
/scents/[handle]                   — individual scent page (cross-category positioning)
/product/[handle]                  — generic Shopify product page
/product/autivara-one              — auto hero product editorial page
/collection                        — full Shopify product list
/blog, /blog/[slug]                — content marketing
/shipping, /returns                — policy pages
```

### 2.2 SEO surface inventory

Long-tail pages auto-generated from data files:

| Surface | File | Initial entries | Expansion path |
|---|---|---|---|
| Auto · vehicles | `lib/mock-db.ts` + Sanity vehicle schema | 17 luxury brands × multiple models | Add brands/models to Sanity |
| Home · rooms | `lib/seo-surfaces.ts` → `HOME_ROOMS` | 6 (living, bedroom, kitchen, bathroom, nursery, entryway) | Append to `HOME_ROOMS` |
| Office · sizes | `lib/seo-surfaces.ts` → `OFFICE_SIZES` | 4 (private, small team, open-plan, meeting room) | Append to `OFFICE_SIZES` |
| Industrial · use cases | `lib/seo-surfaces.ts` → `INDUSTRIAL_USE_CASES` | 7 (hotel, salon, retail, real estate, fitness, dental, restaurant) | Append to `INDUSTRIAL_USE_CASES` |
| Scents | `lib/scent-catalog.ts` → `SCENTS` | 3 (Savage, Compassion, Vanilla Macadamia) | Add to `SCENTS` + Shopify |

Each long-tail page ships with: H1, meta title/description, BreadcrumbList JSON-LD, FAQPage JSON-LD, scent pairings, intensity/coverage, considerations, and category-specific keyword footer.

---

## 3. Analytics & ad-pixel infrastructure

All wired into `components/analytics/`. Dormant until env vars are populated.

| File | Purpose |
|---|---|
| `Analytics.tsx` | Master loader. Conditionally mounts each pixel based on env vars. |
| `GoogleAnalytics.tsx` | GA4 via `gtag.js` |
| `MetaPixel.tsx` | Meta (Facebook/Instagram) Pixel + `<noscript>` fallback |
| `TikTokPixel.tsx` | TikTok `ttq` pixel |
| `PinterestTag.tsx` | Pinterest `pintrk` tag + `<noscript>` fallback |
| `events.ts` | Unified event helpers fanning out to all 4 platforms |
| `ProductViewTracker.tsx` | Fires `ViewContent` / `view_item` on product mount |

**Category dimension:** Every event now carries a `category` field (Auto / Home / Office / Industrial / Scent), sourced from Shopify product tags via `lib/category.ts`. This unlocks GA4 audience segmentation, Meta Advantage+ category-specific creative, and TikTok category-level CPA targeting.

### 3.1 Events firing

| Event | GA4 | Meta | TikTok | Pinterest | Fires from |
|---|---|---|---|---|---|
| Page view | `page_view` | `PageView` | `page` | `pagevisit` | Pixel init scripts |
| Product view | `view_item` | `ViewContent` | `ViewContent` | `pagevisit` | `ProductViewTracker` (auto product pages — extend to others when more products ship) |
| Add to cart | `add_to_cart` | `AddToCart` | `AddToCart` | `addtocart` | `cart-context.tsx` after add succeeds |
| Remove from cart | `remove_from_cart` | — | — | — | `cart-context.tsx` after remove succeeds |
| Begin checkout | `begin_checkout` | `InitiateCheckout` | `InitiateCheckout` | `checkout` | `CartDrawer.tsx` Checkout click |
| Purchase | (from Shopify) | (from Shopify CAPI) | (from Shopify) | (from Shopify) | Shopify-hosted checkout — requires native apps |

### 3.2 SEO infrastructure

| Feature | Status |
|---|---|
| Canonical URLs | ✅ Every route |
| OpenGraph + Twitter cards | ✅ Every route |
| Title template `%s \| Autivara` | ✅ |
| Robots directives | ✅ |
| Site verification (Google, Bing, Yandex, Meta, Pinterest, TikTok) | ✅ Env-driven |
| Organization + WebSite JSON-LD | ✅ Root layout |
| Product JSON-LD | ✅ Product pages |
| BreadcrumbList JSON-LD | ✅ Product, fitment, blog, surface pages, scent pages |
| FAQPage JSON-LD | ✅ All SEO surface pages (auto fitment, home rooms, office sizes, industrial use cases) when FAQ data exists |
| `sitemap.xml` | ✅ Includes: categories, surface hubs, all surfaces, scents, blog, products, fitment vehicles |
| `robots.txt` | ✅ |

---

## 4. Human action list — in dependency order

### 🔴 Blocks deployment

1. **Wire Vercel** — link repo, set master as production branch, add `autivara.com` + `www.autivara.com`, update DNS.
2. **Copy `.env` values into Vercel env (Production scope).** Critical: `NEXT_PUBLIC_BASE_URL=https://autivara.com`.

### 🟡 Blocks credible multi-category launch

3. **Per-category product photography.** Currently using Amazon-scraped placeholders. You now need:
   - Auto: hero in luxury cabin (kept from current)
   - Home: hero in living/dining setting
   - Office: hero on desk + open-plan
   - Industrial: hero in hotel lobby + salon
   - Scents: clean studio shots for each oil
   Drop into `/public/image/` and I'll rewire references in one pass.

4. **Shopify product catalog** — you only have one product (`autivara-one`) plus 3 oils in Shopify today. To launch all 4 categories you need:
   - 1 auto product (existing) — tag with `auto`
   - 1 home product — create + tag with `home`
   - 1 office product — create + tag with `office`
   - 1 industrial product — create + tag with `industrial`
   - All scent products tagged `scent`
   - **Tag every product** so `lib/category.ts` can route analytics events correctly.

### 🟢 Pre-launch but non-blocking

5. **Shopify Subscriptions** — install free native app, create 30/60/90-day plan @ 10% off applied to all oil products, paste SellingPlan GIDs into `lib/subscription-plans.ts`.

6. **Create ad platform accounts and paste IDs into Vercel env:** GA4, Meta Pixel, TikTok Pixel, Pinterest Tag. Use names from `.env.example`.

7. **Site verification** — paste content values for Google Search Console, Bing Webmaster, Meta Business domain, Pinterest, optional Yandex.

8. **Connect Shopify's native apps for server-side events:**
   - Facebook & Instagram → Meta CAPI (Purchase tracking)
   - TikTok → Events API
   - Google & YouTube → Merchant Center + GA4 conversions

9. **Submit sitemap** to Google Search Console + Bing Webmaster.

---

## 5. SEO strategy — the primary growth lever

### 5.1 Your four unfair advantages

Each category has its own programmatic SEO surface. Combined: well over 100 long-tail pages, all schema-rich, all uniquely written:

| Surface | URL pattern | Target queries |
|---|---|---|
| Auto · vehicles | `/fitment/[brand]/[model]` | "best diffuser for Porsche 911", "Mercedes S-Class car diffuser" |
| Home · rooms | `/home/rooms/[room]` | "best diffuser for living room", "nursery diffuser", "kitchen scenting" |
| Office · sizes | `/office/sizes/[size]` | "diffuser for home office", "open-plan office scenting", "boardroom fragrance" |
| Industrial · use cases | `/industrial/use-cases/[type]` | "boutique hotel diffuser", "salon fragrance system", "dental office scent" |

### 5.2 Cornerstone content (blog) — by category

Each category gets 3-5 high-intent posts (15-20 total). All cross-link to relevant SEO surface pages and product pages.

**Auto:**
- Aera vs. Pura vs. Autivara: 2026 luxury car diffuser comparison
- Why ultrasonic car diffusers leak — and what to buy instead
- How to scent a Porsche 911 without ruining the cabin
- Are essential oil diffusers safe in cars? (Vet + materials science)

**Home:**
- Pet-safe diffusers: a 2026 buyer's guide
- Diffuser vs. candle vs. plug-in: which works in your home
- The complete guide to interior-safe home fragrance (hardwood, marble, upholstery)
- Why most bedroom diffusers ruin your sleep

**Office:**
- Does workplace scenting actually improve focus? (Peer-reviewed)
- Scent policies and the modern office: what HR needs to know
- How to scent an open-plan agency without anyone complaining
- The 8-hour-day diffuser test: what works, what causes headaches

**Industrial:**
- Hotel Collection vs. Aroma360 alternative — for SMBs
- The 10-room boutique hotel scenting playbook
- Retail scent and dwell time: what the studies actually show
- Why your dental waiting room smells wrong (and the fix)

### 5.3 Internal linking map

```
Home (/)
 ├─→ /auto → /product/autivara-one + /fitment hub → /fitment/[brand]/[model]
 ├─→ /home → /home/rooms → /home/rooms/[room]
 ├─→ /office → /office/sizes → /office/sizes/[size]
 ├─→ /industrial → /industrial/use-cases → /industrial/use-cases/[type]
 ├─→ /scents → /scents/[handle] → cross-links to each category
 └─→ /blog → /blog/[slug] → relevant category + surface + product
```

Every SEO surface page links back up to its category landing AND down to scent pages. Every scent page links sideways to all 4 categories with custom positioning per category.

### 5.4 Core Web Vitals targets

| Metric | Target |
|---|---|
| LCP | <2.5s |
| INP | <200ms |
| CLS | <0.1 |

Run Lighthouse on `/`, `/auto`, `/home`, `/office`, `/industrial`, `/scents`, `/product/autivara-one`, and one of each surface page after deploy.

---

## 6. Purchase tracking — the tricky part

Site uses Shopify hosted checkout, so Purchase happens off `autivara.com`. Solved by Shopify's native apps (step 8 in action list) — they inject pixel events on Shopify checkout pages and send server-side conversions to each platform.

**Without those native apps, you see InitiateCheckout but NO Purchase.** Install before any campaign.

---

## 7. Organic launch plan — week by week

### Week 1: Foundation
- Vercel + autivara.com live
- All pixels verified in each platform's debug tool
- GSC verified, sitemap submitted, Merchant Center connected
- All 4 category landings pass Lighthouse
- Real product photography in all categories
- Email capture form (Klaviyo free or Shopify Email)

### Week 2-3: Content seeding
- 1 cornerstone blog post per category (4 total)
- Social account in each platform (X, Instagram, TikTok)
- 5 posts per platform showcasing different categories

### Week 4: Community + outreach
- Submit to ProductHunt, BetaList, Indie Hackers
- Launch threads on r/Shopify, r/Entrepreneur, X
- Seed 10 creators per category (40 total) with free product:
  - Auto: car YouTubers/TikTokers
  - Home: design accounts, home tour creators
  - Office: productivity creators, home-office influencers
  - Industrial: hospitality consultants, salon owners

### Week 5+: Iteration
- Check Search Console weekly per category — which surface gains impressions first?
- Add 2 blog posts per week, rotating categories
- Add new SEO surface entries when one category outperforms (e.g., if "industrial: hotel" wins, add "industrial: gym", "industrial: airbnb host")

---

## 8. When to flip the paid switch — per category

Different categories warrant different paid timing. Do not paid-blast all 4 categories at once.

**Per-category readiness gate:**
- Category landing has been live ≥30 days
- ≥10 organic orders attributed to that category
- Meta Pixel + CAPI showing category-segmented events
- Clear "winning" content angle from organic
- ≥30 days of category-tagged historical pixel data

First category to hit gate: probably **Auto** (most content built, hero product exists). Start with Meta Advantage+ Shopping at $30/day for 7 days — the catalog feed handles the rest.

---

## 9. Channel priority — ranked

1. **Organic SEO across 4 surfaces** — the compound moat
2. **TikTok organic** — by category creator network (auto / home / office / industrial)
3. **Pinterest organic** — strongest for home + industrial categories
4. **YouTube/TikTok creator seeding** — free product, real reviews
5. **Google Search ads (branded)** — protect "autivara" SERP from competitors
6. **Google Shopping (free organic listings)** — via Merchant Center
7. **Meta Advantage+ Shopping** — only after category readiness gate
8. **Influencer paid partnerships** — last priority

---

## 10. Reference — file map

```
app/
  page.tsx                                — 4-category homepage
  layout.tsx                              — root metadata, verification, Analytics
  auto/page.tsx                           — Auto category landing
  home/page.tsx                           — Home category landing
  home/rooms/page.tsx                     — Home SEO hub
  home/rooms/[room]/page.tsx              — Home SEO surface
  office/page.tsx                         — Office category landing
  office/sizes/page.tsx                   — Office SEO hub
  office/sizes/[size]/page.tsx            — Office SEO surface
  industrial/page.tsx                     — Industrial category landing
  industrial/use-cases/page.tsx           — Industrial SEO hub
  industrial/use-cases/[type]/page.tsx    — Industrial SEO surface
  scents/page.tsx                         — Scent catalog
  scents/[handle]/page.tsx                — Individual scent (cross-category)
  fitment/page.tsx                        — Auto SEO hub
  fitment/[brand]/[model]/page.tsx        — Auto SEO surface
  product/[handle]/page.tsx               — Generic Shopify product
  product/autivara-one/page.tsx           — Auto hero editorial
  blog/page.tsx, blog/[slug]/page.tsx     — Journal
  sitemap.ts                              — Includes all of the above

components/
  Header.tsx                              — Auto/Home/Office/Industrial/Scents nav
  SurfacePage.tsx                         — Reusable SEO surface layout (rooms/sizes/use-cases)
  BreadcrumbJsonLd.tsx                    — Schema
  FaqJsonLd.tsx                           — Schema
  ProductJsonLd.tsx                       — Schema
  analytics/                              — All 4 pixels + events + tracker

lib/
  seo-surfaces.ts                         — HOME_ROOMS, OFFICE_SIZES, INDUSTRIAL_USE_CASES
  scent-catalog.ts                        — SCENTS with cross-category positioning
  category.ts                             — Shopify tag → category label mapping
  mock-db.ts                              — Auto fitment fallback (Sanity primary)
  upsell-products.ts                      — Signature oils with Shopify GIDs
  subscription-plans.ts                   — 30/60/90 day refill plans (needs GIDs)
  shopify.ts                              — Storefront API client
  blog-data.ts                            — Cornerstone articles

files/scent_diffuser_research.md          — Source market research (May 2026)
.env.example                              — Every required env var documented
MARKETING.md                              — This file
```

---

## 11. Open questions / future enhancements

- [ ] Devices per category — currently only auto exists. Source/spec the home, office, industrial hardware.
- [ ] Klaviyo or Shopify Email for newsletter + abandoned-cart flow
- [ ] Review collection app (Junip, Loox, Stamped) once shipping
- [ ] `/thank-you` route for backup client-side Purchase event (defer until >100 orders/mo)
- [ ] `AggregateRating` JSON-LD once 10+ reviews collected per product
- [ ] Sanity content expansion: write unique copy for each SEO surface, replace mock-db defaults
- [ ] Cookie consent banner if targeting EU (GDPR)
- [ ] `hreflang` tags if expanding beyond English
- [ ] Multi-currency display (Shopify Markets integration) for international launch

---

*Last updated: 2026-05 — 4-category architecture complete. Auto launch first; home/office/industrial follow after category readiness gates per Section 8.*
