# Image-Generation Prompt Pack — fill the 3 products short of 4 images

Use these in a reference-capable image model — **Google Nano Banana / Gemini 2.5 Flash Image**, **GPT-image-1**, or **Midjourney** (with `--cref`). Where a reference image is given, use **image-to-image** so the generated shot matches the real product.

Needed: **Solar ×4** (no reference — see caveat), **Volcano ×1**, **Pear ×2**. Total **7 images**.

---

## GLOBAL SPEC — apply to every prompt
- **1:1 square, ≥2000×2000.**
- **Hero/product shots: pure white seamless background**, soft even studio lighting, subtle contact shadow, product centered. (The storefront renders product shots with `mix-blend-multiply`, which keys out white — so white backgrounds are required, anything else shows through.)
- **Photorealistic commercial product photography**, sharp focus, high detail.
- **Negative / must-not-contain (every image):** no text, no captions, no spec callouts, no watermark, no brand names or logos, no Chinese characters, no other-brand marks.
- Keep lighting/style consistent with the product's existing photos so the gallery looks like one set.

Save each output as described, then follow **Integration** at the bottom.

---

## 1. Solar — `autivora-solar-car-diffuser` (need 4) ⚠️ no reference
**Product:** a compact clip-on **sun-powered car air-vent diffuser** — a small disc/cylinder with a circular solar face and a **spinning metal rotor** that turns in sunlight; brushed-silver + matte-black finish; vent clip on the back.

> ⚠️ **Caveat:** the original "solar" folder was the wrong product (perfume jugs / a TV), so I have **no real reference**. These prompts are a *representative* render and won't exactly match the unit your supplier ships. Best fix: grab **one real photo** of the actual product from the Alibaba listing (or a sample) and use it as an image-to-image reference for all 4 — then accuracy is guaranteed. Prompts below are the fallback if you can't.

- **solar-1 (hero, white):** "Product photography of a compact sun-powered car air-vent diffuser on a pure white seamless background. Small disc-shaped clip-on unit with a circular solar-panel face and a spinning silver fan rotor in the center, brushed-silver and matte-black finish, vent clip behind. Soft even studio lighting, subtle contact shadow, centered, photorealistic, ultra-sharp, 1:1."
- **solar-2 (lifestyle):** "The same sun-powered car diffuser clipped onto a modern luxury car dashboard air vent, sunlight streaming across the dash catching the solar panel, rotor mid-spin with slight motion blur, premium automotive interior, shallow depth of field, warm natural light, photorealistic, 1:1."
- **solar-3 (detail):** "Extreme macro close-up of the solar panel and spinning silver rotor of the car diffuser, metallic blade and solar-cell texture, dramatic side lighting on a white background, photorealistic, 1:1."
- **solar-4 (in hand / scale):** "A hand holding the compact sun-powered car-vent diffuser to show its small scale, soft neutral studio background, photorealistic, 1:1."

---

## 2. Volcano — `autivora-volcano-flame-diffuser` (need 1)
**Reference (image-to-image):** `https://autivara.com/products/autivora-volcano-flame-diffuser/autivora-volcano-flame-diffuser-1.jpg`
**Product:** a white **egg/ovoid-shaped diffuser** with a glowing warm-orange top basin and a softly lit translucent lower reservoir, touch icons (power / timer / light) on the front.

- **volcano-4 (hero, white):** "Using the provided diffuser as the exact product, create a clean studio product shot on a pure white seamless background. White ovoid diffuser with a glowing warm-orange top basin and softly backlit lower reservoir, subtle touch controls on the front, centered, soft even lighting, subtle contact shadow, photorealistic, 1:1. Keep the product identical; remove any surrounding props."

*(This gives it a clean white hero to sit as the main image; its other 3 are lifestyle/detail.)*

---

## 3. Pear — `autivora-pear-car-diffuser` (need 2)
**Reference (image-to-image):** `https://autivara.com/products/autivora-pear-car-diffuser/autivora-pear-car-diffuser-1.jpg`
**Product:** a glossy **pale-green pear-shaped** car diffuser with a small green leaf-stem on top, smooth ceramic-like finish.

> ⚠️ **Caveat:** the real product has **"Fresh fruits / LUCKY BREAK" printed on it** (another brand). The prompts below generate a **clean, unbranded** pear, which looks better on the store but won't exactly match the printed unit you ship. If you'd rather match the physical product, keep the printing — but then it carries someone else's brand name. Your call.

- **pear-1 (hero, white):** "Using the provided pear-shaped car diffuser as the product, create a clean studio shot on a pure white seamless background. Glossy pale-green pear-shaped car air-freshener with a small green leaf-stem on top, smooth ceramic-like finish, centered, soft studio lighting, subtle contact shadow, photorealistic, 1:1. Clean unbranded surface — no text or printing of any kind."
- **pear-2 (lifestyle):** "The pale-green pear diffuser resting at a modern car's air vent, clean premium car interior, soft natural light, shallow depth of field, photorealistic, 1:1. Clean unbranded pear surface, no text, no logos."

---

## Integration — once you've generated them
1. Drop the new files into the matching reprocess folders, named in sequence after the existing ones:
   - `…/autivora-images/v2/01_sun-powered/01.jpg … 04.jpg`
   - `…/autivora-images/v2/07_volcano/04.jpg`
   - `…/autivora-images/v2/19_pear/01.jpg`, `02.jpg` *(replace the LUCKY-BREAK + Chinese-text ones)* and add `03.jpg`, `04.jpg`
2. Tell me they're in — I'll re-run `build_catalog.py` + `build-novelty-csv.mjs`, which re-stages `/public/products`, rebuilds the CSV, flips those 3 products to **Active (4 images)**, then commit + push.
3. **Re-import the CSV** in Shopify to push the new images onto the live products.

After that, all **19 products** have the full main-image-plus-3-thumbnails gallery.
