# Autivora — Launch Checklist

Sequential checklist from "code on GitHub" to "live store taking orders." Work top-to-bottom — later phases depend on earlier ones. Mark each box as you complete it.

**Estimated total time:** 6-10 hours spread across 2-3 days (most of which is account creation + DNS propagation, not technical work).

---

## Phase 1 — Vercel deployment (~30 min + DNS wait)

Goal: `https://autivara.com` resolves to your Next.js site.

- [ ] **1.1 Create Vercel account** at https://vercel.com/signup using your GitHub account (`winsley-jeune` or whichever owns the repo).
- [ ] **1.2 Import the project**
  - Vercel dashboard → "Add New..." → "Project"
  - Select repo `winsley-jeune/autivora`
  - Framework preset auto-detects as Next.js — leave defaults
  - **Do not deploy yet.** Click "Environment Variables" first.
- [ ] **1.3 Add environment variables** (Production scope — paste these BEFORE deploying)

  Required:
  | Key | Value |
  |---|---|
  | `SHOPIFY_STORE_DOMAIN` | (from your existing `.env`) |
  | `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | (from your existing `.env`) |
  | `NEXT_PUBLIC_BASE_URL` | `https://autivara.com` |

  Optional (paste blank for now, fill in during Phase 4):
  | Key | Value |
  |---|---|
  | `NEXT_PUBLIC_SANITY_PROJECT_ID` | (if using Sanity) |
  | `NEXT_PUBLIC_SANITY_DATASET` | `production` |
  | `SANITY_API_TOKEN` | (if using Sanity) |

- [ ] **1.4 Deploy** — click "Deploy". First build takes ~2-3 min.
- [ ] **1.5 Verify the temp URL works** — Vercel gives you `autivora-xxxxx.vercel.app`. Open it. Confirm:
  - Homepage loads
  - `/auto`, `/home`, `/office`, `/industrial`, `/scents` all load
  - `/product/autivora-one` loads (will show fallbacks if Shopify product handle isn't set yet — fix in Phase 2)
- [ ] **1.6 Add custom domain**
  - Vercel project → Settings → Domains
  - Add `autivara.com` and `www.autivara.com`
  - Vercel shows the DNS records to set
- [ ] **1.7 Update DNS at your registrar**
  - Where you bought `autivara.com` (GoDaddy, Namecheap, Squarespace, etc.)
  - Add the A record + CNAME Vercel showed you
  - **OR** point nameservers to Vercel's (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`) — simpler if you don't have other DNS records
  - Propagation: usually <1 hour, can take up to 24
- [ ] **1.8 SSL auto-issues** once DNS resolves. Confirm `https://autivara.com` loads with valid cert.

---

## Phase 2 — Shopify setup (~45 min)

Goal: Products live, tagged, with subscriptions wired.

- [ ] **2.1 Log into Shopify admin** at `admin.shopify.com` → your store
- [ ] **2.2 Verify the product handle**
  - Products → All products → "The Autivora One"
  - URL handle should be exactly `autivora-one` (lowercase, hyphenated)
  - If it's anything else, edit and save
- [ ] **2.3 Tag every product**
  - Open each product → Tags field
  - Tag the diffuser device(s): `auto` (and later `home`, `office`, `industrial` as you add those SKUs)
  - Tag each oil: `scent`
  - Save each
- [ ] **2.4 Confirm oil product GIDs match `lib/upsell-products.ts`**
  - In Shopify admin, the URL when editing each oil shows the numeric product ID
  - Expected (from `lib/upsell-products.ts`):
    - Savage: `7306062987344`
    - Compassion: `7306062954576`
    - Vanilla Macadamia: `7306062856272`
  - If mismatched, update the file with the correct numeric IDs
- [ ] **2.5 Install Shopify Subscriptions app** (free, native)
  - Shopify admin → Apps → "Shopify Subscriptions"
  - Install. No cost.
- [ ] **2.6 Create the subscription plan**
  - Apps → Subscriptions → "Create subscription plan"
  - Plan name: "Autivora Oil Refills"
  - 3 delivery options: every 30 / 60 / 90 days
  - Discount: 10% per delivery
  - Apply to all 3 oil products
  - Save
- [ ] **2.7 Get the SellingPlan GIDs**
  - In the Subscriptions app, click into each delivery option
  - The URL shows `selling_plans/1234567890` — that's the GID
  - You need three: one for 30 days, one for 60, one for 90
- [ ] **2.8 Update `lib/subscription-plans.ts`**
  - Open the file
  - Replace the 3 `undefined` values with the GIDs in format: `gid://shopify/SellingPlan/1234567890`
  - Commit and push (Vercel auto-redeploys)

---

## Phase 3 — Shopify native marketing apps (~30 min)

Goal: Server-side conversion tracking so Meta/TikTok/Google see purchases.

These apps inject pixel + CAPI/Events API code on Shopify's hosted checkout. **Without them you'll see InitiateCheckout but NO Purchase events**, breaking attribution.

- [ ] **3.1 Install "Facebook & Instagram" app**
  - Shopify App Store → search "Facebook & Instagram by Meta" → Install
  - Connect to your Meta Business Manager (create one if needed at business.facebook.com)
  - Connect Facebook Page (create one if you don't have it yet)
  - Enable: Pixel, Conversions API, Facebook Shop
- [ ] **3.2 Install "TikTok" app**
  - Shopify App Store → "TikTok" by TikTok Inc. → Install
  - Connect TikTok Business account (create at business.tiktok.com)
  - Enable: Pixel, Events API
- [ ] **3.3 Install "Google & YouTube" app**
  - Shopify App Store → "Google & YouTube" → Install
  - Connect your Google account
  - Enable: Google Analytics 4, Google Ads conversion tracking, Merchant Center product feed
  - This gives you **free organic Google Shopping listings** with zero ad spend

---

## Phase 4 — Analytics & ad-platform accounts (~90 min)

Goal: Pixel IDs and verification codes pasted into Vercel env vars.

Every step here produces ONE string. After each, copy it into Vercel env (Project Settings → Environment Variables → Edit, paste the value, Save). After all are set, redeploy from the Deployments tab so the new env vars take effect.

### 4.1 Google Analytics 4

- [ ] Go to https://analytics.google.com
- [ ] Admin (gear icon, bottom left) → Create Property
- [ ] Property name: "Autivora", currency: USD, timezone: yours
- [ ] Business details → small, ecommerce
- [ ] Create a Web data stream — URL: `https://autivara.com`, name: "Autivora Web"
- [ ] Copy **Measurement ID** (format `G-XXXXXXXXXX`)
- [ ] Paste into Vercel as `NEXT_PUBLIC_GA4_ID`

### 4.2 Google Search Console

- [ ] Go to https://search.google.com/search-console
- [ ] Add property → "URL prefix" → `https://autivara.com`
- [ ] Verification method: "HTML tag"
- [ ] Copy the `content="..."` value
- [ ] Paste into Vercel as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
- [ ] Redeploy in Vercel → return to GSC → click "Verify"
- [ ] After verified, Sitemaps menu → submit `https://autivara.com/sitemap.xml`

### 4.3 Bing Webmaster Tools

- [ ] Go to https://www.bing.com/webmasters
- [ ] Sign in with Microsoft account
- [ ] Quickest path: "Import from Google Search Console" — clones your verification
- [ ] If using HTML tag: copy `content="..."` value
- [ ] Paste into Vercel as `NEXT_PUBLIC_BING_SITE_VERIFICATION`
- [ ] Submit sitemap same as GSC

### 4.4 Meta Pixel + Domain Verification

- [ ] Go to https://business.facebook.com
- [ ] Events Manager (left nav) → Connect Data Sources → Web → Get Started
- [ ] Pixel name: "Autivora Pixel"
- [ ] Verify the domain `autivara.com` you'll connect
- [ ] Copy **Pixel ID** (numeric)
- [ ] Paste into Vercel as `NEXT_PUBLIC_META_PIXEL_ID`
- [ ] In Meta Business Manager → Business Settings → Brand Safety → Domains → Add `autivara.com`
- [ ] Verification method: "Meta-tag verification"
- [ ] Copy the `content="..."` value
- [ ] Paste into Vercel as `NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION`

### 4.5 TikTok Pixel

- [ ] Go to https://ads.tiktok.com
- [ ] If not done in Phase 3.2: create TikTok Business account
- [ ] Tools → Events → Web Events → Set up Web Events → Manual installation
- [ ] Pixel name: "Autivora"
- [ ] Copy **Pixel ID**
- [ ] Paste into Vercel as `NEXT_PUBLIC_TIKTOK_PIXEL_ID`

### 4.6 Pinterest Tag

- [ ] Go to https://business.pinterest.com
- [ ] Convert / create Business account
- [ ] Verify your website: Settings → Claim → autivara.com → meta tag method
- [ ] Copy meta tag `content="..."` value
- [ ] Paste into Vercel as `NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION`
- [ ] Ads → Conversions → Tag Manager → Create tag
- [ ] Copy **Tag ID** (numeric)
- [ ] Paste into Vercel as `NEXT_PUBLIC_PINTEREST_TAG_ID`

### 4.7 Final redeploy

- [ ] Vercel → Deployments → latest → "Redeploy"
- [ ] After deploy, visit `https://autivara.com` and use each platform's debug tool to confirm events fire:
  - GA4 → Reports → Realtime
  - Meta Events Manager → Test Events
  - TikTok → Events → Diagnostics
  - Pinterest → Conversions → Tag Health

---

## Phase 5 — Social media presence (~60 min)

Goal: Owned accounts on every platform you'll market on. Branded handles claimed before competitors.

- [ ] **5.1 Instagram**
  - Create `@autivora` account at https://instagram.com (or `@autivora.official` if taken)
  - Switch to Business account: Settings → Account → Switch to professional → Business
  - Category: "Product/Service"
  - Add `https://autivara.com` to bio
  - Connect to Facebook Page from Phase 3.1
- [ ] **5.2 TikTok**
  - Create `@autivora` at https://tiktok.com
  - Switch to Business: Settings → Manage account → Switch to Business
  - Category: "Beauty & Personal Care" or "Home & Living"
  - Add website link
- [ ] **5.3 Pinterest**
  - Already created in Phase 4.6 — just complete the profile
  - Add cover image, bio, link to site
  - Create 5-10 boards: "Luxury Car Interiors", "Living Room Scenting", "Office Atmosphere", "Boutique Hotel Design", "Home Fragrance", etc.
- [ ] **5.4 X (Twitter)**
  - Create `@autivora` at https://x.com/i/flow/signup
  - Add bio, link, profile + banner images
- [ ] **5.5 YouTube** (optional but recommended for product demo)
  - Create channel from Phase 3.3 Google account
  - youtube.com/account → Create a channel → "Autivora"
  - Upload eventual product hero video here

---

## Phase 6 — Email marketing & lifecycle flows (~30 min)

Goal: Capture emails, recover abandoned carts, welcome new buyers.

- [ ] **6.1 Choose platform**
  - Recommendation: **Klaviyo** — free up to 250 contacts, deepest Shopify integration
  - Alternative: Shopify Email — free, simpler, less powerful
- [ ] **6.2 Install Klaviyo Shopify app**
  - Shopify App Store → Klaviyo → Install
  - Klaviyo auto-syncs customers, orders, products, and visitor browsing data
- [ ] **6.3 Set up 3 essential flows**
  - **Welcome flow** — fires when someone subscribes to newsletter. 3 emails over 7 days: brand story, product overview, first-purchase incentive
  - **Abandoned cart** — fires 1h, 24h, 72h after cart abandonment. Most-converting flow in ecommerce.
  - **Browse abandonment** — fires when visitor views product 3+ times without buying
- [ ] **6.4 Add a newsletter signup to the site**
  - Klaviyo provides an embed → drop into footer or as a pop-up
  - Goal: 50-100 emails before paid launch

---

## Phase 7 — Pre-launch QA (~60 min)

Goal: Everything works end-to-end before you tell anyone about it.

- [ ] **7.1 Live checkout test**
  - Visit `https://autivara.com/product/autivora-one`
  - Add device + 1 oil + subscribe option to cart
  - Proceed to Shopify checkout
  - Complete purchase with a real card (you can refund yourself in Shopify)
  - Verify the order shows in Shopify admin
  - Verify Purchase event fires in Meta Events Manager (Test Events) within 5 min
  - Verify subscription line item shows as recurring in the order
- [ ] **7.2 Mobile QA**
  - Test on actual phone (not just devtools)
  - Navigation, cart drawer, checkout flow
- [ ] **7.3 Lighthouse audit**
  - Chrome devtools → Lighthouse → run on `/`, `/product/autivora-one`, `/auto`, `/home/rooms/living-room`
  - Targets: LCP <2.5s, INP <200ms, CLS <0.1
  - If hero image is slow, ensure Next `<Image>` has `priority` prop
- [ ] **7.4 Schema validation**
  - Run https://search.google.com/test/rich-results on each page type
  - Confirm BreadcrumbList, Product, FAQPage all validate
- [ ] **7.5 Cross-browser**
  - Safari, Chrome, Firefox, Edge — at minimum visit home + product + cart drawer
- [ ] **7.6 Email a friend**
  - Send the URL to 2-3 people you trust, ask them to try buying
  - Watch them on screen-share without coaching — note every confusion point

---

## Phase 8 — Soft launch (~30 min active + ongoing)

Goal: First real traffic, first real customer, first real signal.

- [ ] **8.1 Post on personal social** — your own X, IG, LinkedIn announcing the launch
- [ ] **8.2 Submit to launch communities**
  - ProductHunt — schedule a launch day, prep your assets first
  - BetaList — submit at https://betalist.com/submit
  - r/Shopify, r/entrepreneur, r/EntrepreneurRideAlong — share your build journey thread
- [ ] **8.3 Creator seeding** — send 10 free units to TikTok/Instagram creators in: luxury car, home design, productivity/office, hospitality. Ask for honest reviews, no contract.
- [ ] **8.4 Reddit community participation**
  - r/cars, r/Porsche, r/BMW for auto
  - r/InteriorDesign, r/HomeImprovement for home
  - r/digitalnomad, r/wfh for office
  - DO NOT spam links — be useful, let signature/profile drive discovery
- [ ] **8.5 Set up Google Alerts** for "Autivora" and "car diffuser" to monitor mentions

---

## Phase 9 — First 30 days monitoring (~15 min/day)

- [ ] Daily: check Shopify dashboard for orders + revenue
- [ ] Daily: respond to all DMs, comments, emails within 24h (real customer support is your moat vs. Hotel Collection)
- [ ] Weekly: check Google Search Console — which fitment/room/use-case pages are gaining impressions?
- [ ] Weekly: check Meta Pixel + GA4 — funnel conversion rate at each step
- [ ] Weekly: post 3-5 pieces of content per platform (TikTok/IG/Pinterest), focused on different categories
- [ ] Monthly: add 1-2 new SEO surface entries to `lib/seo-surfaces.ts` based on Search Console keyword insights

---

## When to flip the paid ads switch

**Do not pay for ads until ALL of these are true** (per-category gates):

- [ ] Site live ≥30 days
- [ ] ≥10 organic orders attributed to this category
- [ ] Meta Pixel + CAPI showing category-segmented events in Events Manager
- [ ] GA4 showing conversion events for this category
- [ ] You have a clear "winning" content angle from organic
- [ ] CAC math: gross margin × LTV ÷ target CAC > 4

First category to hit gate is almost certainly **Auto** (most complete product + content). Start there with Meta Advantage+ Shopping at $30/day for 7 days. Evaluate. Scale if ROAS > 2.

---

## Reference: env vars cheat sheet

After Phase 4, your Vercel env should look like this (Production scope):

```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=<from existing .env>
NEXT_PUBLIC_BASE_URL=https://autivara.com

NEXT_PUBLIC_SANITY_PROJECT_ID=<if using Sanity>
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<if using Sanity>

NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=1234567890
NEXT_PUBLIC_TIKTOK_PIXEL_ID=XXXXXXXXXX
NEXT_PUBLIC_PINTEREST_TAG_ID=2612345678901

NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<from GSC>
NEXT_PUBLIC_BING_SITE_VERIFICATION=<from Bing>
NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION=<from Meta Domains>
NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION=<from Pinterest>
NEXT_PUBLIC_YANDEX_VERIFICATION=<optional>
NEXT_PUBLIC_TIKTOK_SITE_VERIFICATION=<optional>
```

After any change to env vars: Vercel → Deployments → latest → "Redeploy".

---

## What to ask Claude after each phase

- After Phase 1: "Vercel is deployed at <URL>, ready for Phase 2"
- After Phase 2.7: paste me the 3 SellingPlan GIDs — I'll wire `lib/subscription-plans.ts` in 5 min and you push
- After Phase 4: paste me any pixel/verification IDs you want me to verify
- After Phase 7.3: paste the Lighthouse scores — I can help fix any score under 90
- After 30 days: paste your Search Console + Meta + GA4 stats — we'll plan paid launch and SEO surface expansion together

---

*Living document. Update as you check items off. Last updated: 2026-05.*
