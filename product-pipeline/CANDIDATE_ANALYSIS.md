# Candidate Analysis — 27 Alibaba Sourcing Links

**Method:** Inferred from the product-title slug in each Alibaba URL only. Alibaba pages
can't be auto-scraped (anti-bot), so there are **no prices, specs, MOQs, or images yet** —
those come from you for the finalists. This pass is structural triage: dedupe, group by
type, flag risks, and recommend a shortlist that fits Autivora's premium *automotive*
scent positioning ($149-class device + refill oils).

Source rows: `raw/candidates.csv` (27 rows → **26 unique products**).

---

## ⚠️ Flags to act on first

| # | Issue | Recommendation |
|---|-------|----------------|
| 17 & 19 | **Duplicate** — same product (Mini 3D AJ Sneaker), listed twice | Drop one |
| 17/19 | **Trademark risk** — "AJ Sneaker" = Air Jordan / Nike trademark. Selling sneaker-replica fresheners invites takedowns + payment-processor risk | **Exclude** |
| 14 | "Pony" car clip — if it's a branded-character/horse-logo replica, possible IP risk | Verify before selling |
| 2, 6, 7, 8, 9, 10 | **Off-brand** — wall-mounted/HVAC/hotel & home desktop diffusers. Not automotive. Dilutes a car-focused brand + splits SEO | Decide: car-only vs. car+home (see decision below) |
| Whole list | Mixed **price philosophy** — premium electric refill devices vs. $2–5 passive novelty clips. Memory says Autivora is *premium*. Cheap novelty clips fight that positioning | Curate, don't list all |

---

## Grouped by type

### A. Electric / smart car diffusers — **the hero tier** (refill-oil LTV engine)
Powered, rechargeable nebulizing units. This is the category that supports a premium device +
recurring oil-refill model (matches the existing `autivora-one` + subscription scaffolding).
- #4 — Electric USB Rechargeable (custom)
- #16 — Rechargeable **Smart** Car Air Freshener
- #20 — Modern Electric Cordless Car Aromatherapy Diffuser
- #22 — USB Rechargeable **10ml Metal** Essential Oil *(metal = most premium-feeling)*
- #13 — USB Rechargeable Car **+ Household** (dual-use)
- #11 — Mini USB Portable Aroma Oil Diffuser *(small/entry)*
- #15 — Portable Plastic 10ml Car *(likely cheaper plastic variant of #22)*

> Likely your **hero device** lives here. #22 (metal) and #16 (smart) read most premium.

### B. Passive car vent clips / fresheners — accessory / entry tier
No power; scent pad or oil wick. Low price, good as add-ons / impulse buys, NOT the hero.
- #5 — Car Vent Clip Diffuser
- #12 — Car Air Freshener (aromatherapy)
- #25 — Metal Car Perfume clip *(metal = more premium)*
- #26 — Pear-Scent Car Air Freshener
- #3 — Vent Aroma Freshener "Tree" *(Little-Trees style — low-end)*

### C. Luxury / novelty decorative clips — brand-fit risk
Shaped/decorative clips. Some on-brand (camellia, lambskin/leather), some off-brand/risky.
- #23 — Luxury Camellia Car Vent Clip ✅ on-brand premium
- #21 — Luxury **Lambskin** (leather) Car clip ✅ on-brand premium + custom-logo angle
- #18 — "Unique Luxury" Car Vent Freshener — vague, verify
- #14 — Pony Car Vent Clip — ⚠️ verify IP
- #24 — **Halloween** Alloy Vent Decoration — ❌ seasonal novelty, off-brand
- #17/19 — AJ Sneaker — ❌ trademark, exclude

### D. Home / hotel / commercial diffusers — OFF the automotive brand
- #2 — Wall-Mounted App-Controlled Perfume Diffuser
- #6 — Aroma Diffusion **System Machine** (HVAC-scale)
- #7 — CNUS C400B **Hotel** Fragrance Machine
- #8 — Rechargeable Timer **Tower** Diffuser
- #9 — USB **Wood-Grain** Home Diffuser
- #10 — Electric **Home** Aromatherapy Diffuser

### E. Other
- #27 — Custom-Logo Fragrance **Gifts** — a B2B/gifting angle, not core retail
- #1 — "2025 New Style Long-lasting Scent" — too vague to classify; needs the link checked

---

## The one decision that drives everything: **brand scope**

Your store, copy, and categories are currently built around *automotive cold-air scent
diffusion*. Six candidates (group D) are home/hotel units. You can't be both a focused
car brand and a generic diffuser store without hurting positioning and SEO. Pick one:

- **Car-only (recommended, matches current brand):** keep groups A + B + the on-brand
  premium clips from C. Drop D entirely. Cleaner SEO, sharper story.
- **Car + Home (two collections):** keep D too, but it's a bigger catalog, more content,
  and a fuzzier brand. More work, slower to launch.

---

## Recommended starter shortlist (car-only, premium-first)

A focused, launchable catalog instead of 26 SKUs:

| Role | Candidate | Why |
|------|-----------|-----|
| **Hero device** | #22 Metal USB Rechargeable 10ml | Most premium feel; anchors the $149-class positioning + oil refills |
| Smart variant | #16 Smart Rechargeable | "smart/app" upsell tier |
| Entry device | #11 Mini USB Portable | lower price point / gift |
| Premium clip | #23 Camellia **or** #21 Lambskin | on-brand accessory / attach-rate |
| Entry clip | #25 Metal Car Perfume clip | impulse add-on |
| + Refill oils | (your scent line) | the recurring-revenue engine |

That's ~4–5 hardware SKUs + an oil line → 2 collections (e.g. **Diffusers** / **Refill
Oils**, optionally **Accessories**). Tight enough to launch and write great SEO copy for.

---

## What I need from you to move to the build step
For each finalist you choose, the basics I can't get from the link:
1. **Your retail price** (and cost, for margin)
2. **Capacity / battery / coverage** (the 2–3 specs buyers care about)
3. **An image** (your own photo ideal; supplier photo only as temporary placeholder)
4. **Final product name** you want (or let me propose on-brand names)

Then I build the cleaning + **original SEO copy** script and output the Shopify import CSV.
