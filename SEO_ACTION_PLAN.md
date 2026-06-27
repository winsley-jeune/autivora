# Autivara SEO → Sales Action Plan

Owner tags: **[ME]** = I execute in code · **[HUMAN]** = needs you (account/dashboard/real-world) · **[DONE]** = already shipped.
Goal is not rankings for their own sake — it's qualified buyers landing on pages that convert.

## A. Technical SEO & structured data
- [DONE] Product, Article, FAQ, Breadcrumb, Organization, WebSite JSON-LD · metadata · canonical (metadataBase) · sitemap · robots · 301 redirects.
- [ME] `WebSite` **SearchAction** (sitelinks search box eligibility).
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
- [ME] Blog **author entity** (E-E-A-T byline) tied to the brand/about.
- [HUMAN] Provide **social profile URLs** → I add to `sameAs` (authority signal).
- [HUMAN] Install a **reviews app** (Judge.me free) + collect first reviews → I wire Product `aggregateRating` schema (do NOT fake it).

## D. Content volume & depth (drives qualified traffic)
- [DONE] 21 blog articles rewritten (question-first, FAQ schema, real products).
- [ME] **Buying-guide pillar pages** for each collection (car / home / commercial) — comprehensive, internally linked.
- [ME] Add **per-product FAQ + richer copy** to product pages (rank + convert).
- [ME] Add **intro copy + FAQ** to category pages (currently thin for SEO).
- [ME] New **high-intent/bottom-funnel articles** in batches ("best [x] for [y]", gift guides, comparisons that match the catalog).

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
**Wave 3 [in progress]:** D content depth — category intro copy + FAQ (commercial-intent pages first), then per-product FAQ, pillar pages, new articles in batches.
Human items are flagged inline — I'll call them out as each wave lands.
