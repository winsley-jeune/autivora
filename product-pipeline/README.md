# Product Pipeline

Independent, standalone pipeline (NOT part of the Next.js app) that turns the raw
product master sheet into a **clean, SEO-ready Shopify product import CSV**.

> The source product list is **not definitive** — it will change. This pipeline is
> built to be re-run safely every time the sheet is updated.

## Workflow

```
raw/ (your sheet export)  ──►  clean.* (script)  ──►  output/ (Shopify import CSV)
                                                        │
                                                        └─► you review, then import
                                                            via Shopify admin
```

1. **Drop the data** in `raw/` — export the Google Sheet as CSV (File → Download → CSV)
   and save it here, e.g. `raw/products.csv`. (Or share the sheet with the connected
   Google account and it can be pulled directly.)
2. **Run the cleaner** (script added once the real columns are known) — it:
   - normalizes titles, generates SEO-safe URL handles
   - writes SEO meta title + meta description per product
   - cleans/upgrades product descriptions
   - maps products → collections/categories
   - validates prices, variants, required Shopify fields
3. **Review** `output/products-shopify.csv`, then import in Shopify
   (Products → Import). Reversible: nothing goes live until you import.

## Files
- `catalog.json` — source of truth (edit this, then re-run). Real categories, devices, 20 oils.
- `build-csv.mjs` — generator: `node product-pipeline/build-csv.mjs`
- `output/products-shopify.csv` — Shopify import (Products → Import). STATUS=draft.
- `CANDIDATE_ANALYSIS.md` — triage of the 27 Alibaba sourcing links.
- `SCENT_OPTIONS.md` — full scent name menu.
- `raw/candidates.csv` — parsed Alibaba seed list.

## Status
- [x] Folder scaffolded
- [x] Real category structure (Car / Home / Commercial & Industrial / Fragrance Oils)
- [x] Real catalog built — 8 products (5 devices + Clip + 2 Business) + 20 oils (40 variants), 6 collections, market-grounded specs + original SEO
- [x] Full per-product opportunity analysis of all 27 Alibaba candidates → `PRODUCT_ANALYSIS.md`
- [x] Shopify CSV generated (draft)
- [ ] User adds product photos (the one missing input — own/licensed, NOT competitor photos)
- [ ] User confirms/locks prices + sources actual oils
- [ ] Import to Shopify, delete test products, publish
