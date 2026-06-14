# Autivora Product Photography — Shot List & Upload Guide

**Why this is the #1 task:** Every device page (`/product/...`) and all 20 scent pages
currently render a blank box with a tiny "Autivora" text watermark instead of a photo,
because every product in the catalog still has `image: "TODO-your-photo"`. You cannot sell
a $59–$549 physical luxury object with no picture. Fixing this is the single biggest
conversion lever on the site — bigger than any copy or SEO change.

There are **two** places images live, and you need both:

1. **Shopify product images** — what shows on `/product/[handle]` and `/scents`.
   These pull from each Shopify product's image, NOT from the repo. Upload in Shopify admin.
2. **Hardcoded marketing images** in `/public/image/` — e.g. the "Recommended Device"
   block on every fitment page currently points at an **Amazon-scraped placeholder**
   (`/image/616Bu0HYtsL._AC_SL1500_.jpg`). That's an IP risk — replace the file.

---

## CRITICAL: how the site renders images (read before shooting)

The product page displays the hero with `object-contain mix-blend-multiply` on a light
gray background (`app/product/[handle]/page.tsx:122-128`). `mix-blend-multiply` makes
**white pixels disappear**. So:

- **Shoot on a pure white, evenly-lit seamless background** (or cut out to transparent PNG).
  A busy or colored background will show through and look broken.
- Product must be **centered with even margin** — it's contained, not cropped.
- **Square (1:1) aspect ratio**, minimum **2000×2000px**, JPG or PNG.
- Consistent lighting/white balance across ALL shots so the catalog looks like one brand.

DIY on a bootstrap budget: a $30 phone lightbox + white paper sweep + window light is
enough for clean white-background product shots. Shoot all products in one session so
lighting matches.

---

## A. Devices — 8 SKUs (priority order = price/visibility)

For each device: **1 primary** (the hero, on white) is mandatory; the extras lift conversion.

| # | Product | Handle | Price | Primary shot | Recommended extras |
|---|---------|--------|-------|--------------|--------------------|
| 1 | Autivora Drive | `autivora-drive` | $59 | 3/4 hero on white, in/near a cup holder framing | top dial detail · in-cabin lifestyle · USB-C port · scale-in-hand |
| 2 | Autivora Pro | `autivora-pro` | $549 | 3/4 hero on white (flagship — best shot) | size/scale reference · commercial-space lifestyle · control detail |
| 3 | Autivora Home | `autivora-home` | $199 | 3/4 hero on white | on a console/shelf lifestyle · mist/operation · footprint detail |
| 4 | Autivora Home Room | `autivora-home-room` | $109 | 3/4 hero on white | bedside/desk lifestyle · refill bay |
| 5 | Autivora Drive Mini | `autivora-drive-mini` | $34 | 3/4 hero on white | next to standard Drive for size · in vent/cup holder |
| 6 | Autivora Clip | `autivora-clip` | $24 | 3/4 hero on white | clipped to a vent (the key use) · refill action |
| 7 | Business — Leather Clip | `autivora-business-leather-clip` | $19 | 3/4 hero on white | custom-logo mockup · material/leather detail |
| 8 | Business — Custom Freshener | `autivora-business-custom-freshener` | $2 | flat-lay on white | branded/custom-print example · quantity/bulk framing |

**Per-device checklist:** primary (white) · one detail (material/control/port) · one
in-context lifestyle. That trio is the proven minimum for DTC conversion.

---

## B. Scents — 20 oils (one repeatable setup)

All 20 are the same bottle in different labels, so build ONE setup and run them through it.
Prices: $19 (10ml) / $39 (200ml).

- **Primary (each):** single bottle, straight-on or slight 3/4, on pure white, label sharp
  and centered. Identical framing for all 20 so the `/scents` grid looks uniform.
- **Optional brand shots (shoot once, reuse):** a row of bottles as a collection banner;
  one bottle beside a device (cross-sell); a styled flat-lay with a neutral prop
  (linen, stone) for blog/social.

The 20 handles: amalfi-sun, amber-vanilla, cashmere-musk, cedar-sage, citrus-bloom,
cloud-cotton, coastal-linen, eucalyptus-mint, green-bamboo, jasmine-noir, lavender-haze,
noir-oud, peony-petal, pure-rain, santal-royale, smoked-vetiver, tobacco-caramel,
velvet-rose, white-tea-cedar, yuzu-verbena. (Confirm exact handles in Shopify.)

---

## C. Upload steps

### C1. Shopify product images (devices + scents) — fixes the live store
For each product:
1. Shopify admin → **Products** → open the product (match the handle in the table above).
2. **Media** section → drag in the images. **Drag the primary shot to position 1** —
   position 1 becomes the storefront thumbnail and the `featuredImage`.
3. Add **alt text** per image (e.g. "Autivora Drive cold-air car diffuser") — SEO + a11y.
4. **Save.** The storefront updates on next request — the blank "Autivora" placeholder
   is replaced automatically (no code deploy needed).
5. Repeat for all 8 devices and 20 scents. Do the 5 highest-price devices first for
   fastest revenue impact.

### C2. Replace the Amazon-scraped placeholder (IP risk) — needs a deploy
1. Save your real **Autivora Drive** primary shot as a square JPG.
2. Drop it in `/public/image/` (e.g. `autivora-drive-hero.jpg`).
3. In `app/fitment/[brand]/[model]/page.tsx:226`, change
   `src="/image/616Bu0HYtsL._AC_SL1500_.jpg"` → `src="/image/autivora-drive-hero.jpg"`.
4. Delete the old Amazon file from `/public/image/`.
5. Commit + push (I can do steps 3–5 once your image is in `/public/image/`).
   *Also check `app/page.tsx` and the category pages for any other `/image/<amazon-id>.jpg`
   references and swap those too — I can grep and list them when you're ready.*

### C3. Keep future re-imports in sync (optional but recommended)
`product-pipeline/catalog.json` still says `"image": "TODO-your-photo"` for every device.
If you ever re-run the CSV import, it would wipe your uploaded images. Once photos are up,
put the hosted image URLs (Shopify CDN URLs work) into `catalog.json` and re-run
`build-csv.mjs`, so the source of truth matches the live store.

---

## Suggested sequence (one weekend)
1. **Sat AM:** build the white-background setup; shoot the 5 priced devices (Drive, Pro,
   Home, Home Room, Drive Mini) — primary + detail + lifestyle each.
2. **Sat PM:** shoot Clip, the 2 B2B SKUs, and all 20 scent bottles (assembly-line).
3. **Sun:** light edit (white balance, straighten, export 2000×2000), upload to Shopify
   (C1), then ping me to swap the placeholder file and push (C2).

When the Shopify uploads are done, the store goes from "looks broken" to "sellable" with
zero code changes. That's the gap between deployed and a stranger actually buying.
