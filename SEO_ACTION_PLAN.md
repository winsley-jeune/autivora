# Autivara SEO → Sales Action Plan

Owner tags: **[ME]** = I execute in code · **[HUMAN]** = needs you (account/dashboard/real-world) · **[DONE]** = already shipped.
Goal is not rankings for their own sake — it's qualified buyers landing on pages that convert.

## A. Technical SEO & structured data
- [DONE] Product, Article, FAQ, Breadcrumb, Organization, WebSite JSON-LD · metadata · canonical (metadataBase) · sitemap · robots · 301 redirects.
- [DONE] `WebSite` **SearchAction** + on-site `/search` page (product + blog results, header search icon).
- [ME] Enrich **Organization** schema: `contactPoint` (email/support), keep `sameAs` ready for socials.
- [ME] **ItemList** schema on category/collection pages (product carousels in SERP).
- [ME] **OG images** on every category page (/auto, /home, /industrial, /scents, /collection) — currently missing.
- [ME] **Image sitemap** — add product image URLs to sitemap entries (image SEO).
- [ME] Self-referencing **hreflang** (`en-us`) for clean international signals.
- [HUMAN] Submit sitemap in GSC (done) · request indexing on new pages as they ship.

## B. Core Web Vitals & performance
- [ME] `preconnect`/`dns-prefetch` to `cdn.shopify.com` (Shopify product images) — speeds LCP.
- [ME] Ensure hero images use `priority`, below-fold lazy-load, explicit sizes (mostly done; audit).
- [ME] Font `display: swap` to avoid invisible-text layout shift.
- [HUMAN] Run PageSpeed Insights after deploy; send me any failing metric and I'll fix.

## C. E-E-A-T (Expertise, Experience, Authority, Trust)
- [DONE] **/about** page — brand story, what we make, why (experience + expertise signals), linked in footer.
- [DONE] **/faq** page — central FAQ with FAQPage schema (trust + long-tail).
- [DONE] **/privacy** and **/terms** pages — trust/legal completeness (search & buyers expect them).
- [DONE] Blog **author entity** — "Autivara Editorial Team" byline (visible + Article schema `author.url` → /about).
- [HUMAN] Provide **social profile URLs** → I add to `sameAs` (authority signal).
- [HUMAN] Install a **reviews app** (Judge.me free) + collect first reviews → I wire Product `aggregateRating` schema (do NOT fake it).

## D. Content volume & depth (drives qualified traffic)
- [DONE] 21 blog articles rewritten (question-first, FAQ schema, real products).
- [DONE] **Buying-guide pillar pages** for each collection (car / home / commercial) — comprehensive, internally linked, Article + FAQPage schema, linked from category pages.
- [DONE] Add **per-product FAQ** to product pages (category-aware, FAQPage schema).
- [DONE] Add **FAQ to category pages** (/auto, /home, /industrial) — FAQPage schema + indexable copy.
- [DONE — batch 1] **Bottom-funnel articles**: best-diffuser-for-bedroom, how-to-make-your-car-smell-good, best-diffuser-gifts, best-flame-diffuser, how-to-choose-fragrance-oil. (More batches available on request.)

## E. Conversion (turns traffic into sales)
- [ME] Trust signals on product pages (shipping/returns/secure-checkout reassurance).
- [ME] Scent cross-sell on device pages → drives AOV/refill attach (DONE earlier).
- [HUMAN] Oil subscription + bundles in Shopify (LTV engine — see OIL_REFILL_PLAN.md).
- [HUMAN] Reviews (social proof = the #1 conversion lever).

## F. Building recognition / off-page (authority)
- [HUMAN] Google **Merchant Center** + Shopping feed (I'll ensure product data is feed-ready).
- [HUMAN] Business listings, niche/gift/car roundups, supplier/marketplace profiles for early backlinks.
- [HUMAN] Social presence (also feeds `sameAs`).
- [ME] Make the catalog **feed-ready** (clean titles, descriptions, GTIN/MPN fields where possible).

---
### Execution order
**Wave 1 [DONE — 94cae8c]:** A (Organization contactPoint, ItemList, OG images, image sitemap) + B (cdn preconnect, footer).
**Wave 2 [DONE]:** C trust pages (/about, /faq, /privacy, /terms) shipped + sitemap/footer wired.
**Wave 3 [DONE]:** category FAQ (3a), per-product FAQ (3b), three pillar buying guides + category↔guide links (3c).
**Wave 4 [DONE]:** bottom-funnel article batch 1 (5 articles), blog author byline/entity, WebSite SearchAction + /search page.
**Remaining [ME]:** additional article batches on request. **Remaining [HUMAN]:** GA4 ID, reviews app, social URLs (sameAs), Merchant Center feed, oil subscription/bundles.
Human items are flagged inline — I'll call them out as each wave lands.
