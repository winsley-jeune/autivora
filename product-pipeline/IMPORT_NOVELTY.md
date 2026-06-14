# Novelty Line — Shopify Import Guide

Generated artifacts:
- `catalog-novelty.json` — source data for the 19 sourced products (edit this, then re-run the build)
- `build-novelty-csv.mjs` — `node product-pipeline/build-novelty-csv.mjs` → regenerates the CSV
- `output/products-novelty-shopify.csv` — the Shopify import file (57-column official template, multi-image)
- `/public/products/<handle>/` — 34 vetted images, served at `https://autivara.com/products/...`

## ⚠️ Do this FIRST — or images import as broken
The CSV references images at `https://autivara.com/products/...`. Those URLs only resolve **after** `/public/products` is committed and deployed to production. **Deploy first, then import**, otherwise Shopify fetches 404s and the products import imageless.

## Step 1 — Deploy the images
Commit `/public/products` and merge to `main` (Vercel auto-deploys). Verify one URL loads in a browser, e.g.
`https://autivara.com/products/autivora-wood-grain-diffuser/autivora-wood-grain-diffuser-1.jpg`

## Step 2 — Import the CSV
Shopify admin → **Products → Import** → upload `output/products-novelty-shopify.csv` → **Upload and continue** → Import.
- 19 products, 34 images. **4 import as Active** (they have a full 4-image set), **15 import as Draft** (need more images — see below).
- Inventory defaults to 100/SKU. Lower any you can't actually ship before publishing.

## Step 3 — Create the 3 collections
The native CSV can't create collections, so each product is tagged with its collection handle. Create three **automated (smart) collections**, each matching `Product tag = <handle>`:
| Collection title | Match tag |
|---|---|
| Car Diffusers | `car-diffusers` |
| Home Diffusers | `home-diffusers` |
| Industrial & Commercial Scenting | `industrial-scenting` |

## Status split (why 15 are Draft)
Only products with a full 4-image set publish as Active. The rest are Draft until images are added:

| Active (ready) | Draft — images needed |
|---|---|
| Disc (Magnetic Vent) · 4 | Astronaut 3 · Cabin 3 · Bear 2 · Pulse 2 · Ember 2 · Plug 2 |
| Grove (Wood-Grain) · 4 | Jellyfish 1 · Apollo 1 · Atmos Pro 1 · Riff 1 |
| Express (Steam-Train) · 4 | Solar 0 · Hearth 0 · Nova 0 · Reservoir 0 · Orchard 0 |
| Atmos Wi-Fi · 4 | |

To finish a Draft product: add images to its `/public/products/<handle>/` folder (named `<handle>-1.jpg` … `-4.jpg`), add the URLs to its `images` array in `catalog-novelty.json`, re-run the build, re-import. It flips to Active automatically at 4 images.

## Pricing note
Prices are the sourcing sheet's retail figures (premium-positioned, illustrative) with a compare-at anchor ~35% above. Adjust freely in `catalog-novelty.json` — pricing is your call, decoupled from cost.

## ⚠️ Image-source caveat
These 34 are the *clean* subset of supplier listing photos (no watermark/text/wrong-product). They are still the **supplier's** studio images, not original photography — fine to launch with, but original product photos remain the real upgrade for a premium store and remove any residual IP risk.
