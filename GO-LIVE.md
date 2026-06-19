# Autivara Go-Live Checklist (current — supersedes LAUNCH-CHECKLIST.md)

Everything the code/content can do is done and deployed. What's left is **your external actions**, in dependency order. Owner is noted per item. Detailed docs are linked.

---

## Phase 1 — Make the live store correct (do first)
The site is deployed, but Shopify still holds the OLD data. One import fixes most of it.

- [ ] **Re-import the product CSV** — Shopify admin → Products → Import → `product-pipeline/output/products-novelty-shopify.csv`. This pushes, at once: the **pricing-v2 prices**, **premium descriptions**, **"Autivara" titles**, and the **extra product images** for the 16 fully-imaged products. *(Matches by handle; first image URL unchanged so no dupes.)* — **You** · see `product-pipeline/IMPORT_NOVELTY.md`
- [ ] **Archive the old premium SKUs** — in Shopify, filter and Archive the retired premium products (Autivara Drive/Pro/Home/Home Room/Clip and any old premium oils still showing on `/home`). They create duplicate, brand-mismatched listings. — **You**
- [ ] **Create the 3 smart collections** by product tag: `car-diffusers` → "Car", `home-diffusers` → "Home", `industrial-scenting` → "Commercial". — **You** · see `IMPORT_NOVELTY.md`

## Phase 2 — Search & tracking (SEO go-live — nothing ranks until this is done)
All wiring is in the code; it just needs the IDs as Vercel env vars. **These are public codes, not passwords.**

- [ ] **Google Search Console** — add property `https://autivara.com` → HTML-tag verify → set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Vercel → redeploy → Verify → submit `sitemap.xml` → URL-Inspect + Request Indexing on the homepage and top 3 products. — **You** (ping me and I'll confirm the meta tag renders before you hit Verify)
- [ ] **Bing Webmaster Tools** — same pattern, `NEXT_PUBLIC_BING_SITE_VERIFICATION`. — **You**
- [ ] **GA4** — create property → Measurement ID `G-XXXX` → set `NEXT_PUBLIC_GA` in Vercel → redeploy. — **You**
- [ ] **Meta / TikTok pixels** — set `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_TIKTOK_PIXEL_ID` in Vercel (components already wired). — **You**

## Phase 3 — The profit engine (oil subscription + bundles)
The 20 oils already exist on `/scents`. This turns them into recurring revenue. Full detail in `product-pipeline/OIL_REFILL_PLAN.md`.

- [ ] **Confirm the 20 oils are live** in Shopify (`/scents` shows them). If not, import the oils rows from `output/products-shopify.csv`. — **You**
- [ ] **Install Shopify Subscriptions** → create one plan: deliver every **30/60/90 days, ~15% subscriber discount**, applied to all oils → paste the SellingPlan GIDs into `lib/subscription-plans.ts`. — **You** (I'll wire the GIDs if you paste them)
- [ ] **Install Shopify Bundles** → build the 3 starter bundles (Car / Home / Commercial = device + oils) to lift AOV over the $100 free-ship line. — **You** · pricing in `OIL_REFILL_PLAN.md`
- [ ] **Klaviyo (free)** post-purchase flow prompting an oil subscription ~3 weeks after a device order. — **You**

## Phase 4 — Finish product images (3 products)
- [ ] **Generate 9 images** — Solar ×4, Ember (volcano) ×1, Orchard (pear) ×2 — using `product-pipeline/IMAGE_GEN_PROMPTS.md` in an image tool. Drop them in the `v2/` folders (per the doc) and tell me; **I'll re-stage, rebuild the CSV, and push** so those 3 flip to 4-image Active. — **You generate → me to integrate**

## Phase 5 — Channel & growth (decisions to act on)
- [ ] **Don't run paid Shopify/Meta on sub-$50 SKUs** — they go negative on CAC (see `PRICING_MODEL.md`). Sell car/home on **Amazon + organic**; reserve **paid ads for the commercial tier ($79+)**. — **You**
- [ ] **Send me your social profile URLs** (Instagram/TikTok/etc.) and I'll add them to the Organization `sameAs` schema. — **You → me**

---

### Status of the build (all done & deployed)
Catalog normalized to the 19 products · premium descriptions · brand = Autivara everywhere · mobile menu · unified product cards · product gallery + recommendations · home hero + Our Collections · pricing model v2 · SEO technical (Article/FAQ/Breadcrumb/Org/Product schema, metadata, sitemap, robots, redirects) · **all 21 blog articles rewritten** · dead fitment code removed · oil-refill plan.

**Fastest path to a correct, indexable, selling store:** Phase 1 + Phase 2, in that order.
