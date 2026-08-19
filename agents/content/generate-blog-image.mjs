#!/usr/bin/env node
// Turns an EXISTING supplier/product photo into a branded Autivara blog image. This workflow is
// edit-only: it selects a real image already stored under public/products/<product-handle>/ and
// recontextualizes that exact product into the article's use case. It never generates a product
// from a text description.
//
// Costs real money per call (~$0.02-$0.21/image) — this is a one-at-a-time tool, not a silent
// bulk job, so each image gets a human look before wider rollout.
//
// Usage:
//   node agents/content/generate-blog-image.mjs <slug> --product <handle> --use-case "<specific scenario for THIS article>"
//
// Example:
//   node agents/content/generate-blog-image.mjs why-does-my-car-smell-musty \
//     --product autivora-rechargeable-car-diffuser \
//     --use-case "mounted on the vent of an older car on a rainy day, addressing a musty-smell problem"
//
// Writes to: public/blog/<slug>.jpg
// Requires .env: OPENAI_API_KEY
// Setup: see agents/content/README.md
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";
import { readEnv } from "../lib/env.mjs";
import { editImage } from "./lib/openai-image.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..");

const BRAND_STYLE =
  "Transform this existing supplier photograph into premium editorial product photography for " +
  "Autivara, a refined automotive and home-fragrance brand. The supplied photograph is the source " +
  "of truth. Preserve the exact physical product: same shape, proportions, color, materials, " +
  "controls, openings, packaging details, and any branding already printed on it. Do not invent, " +
  "redesign, relabel, or replace the product. Do not add a logo or text to the product. Improve the " +
  "lighting, composition, background, color grading, and overall cleanliness; remove generic " +
  "marketplace staging and visual clutter. Place the real product naturally in the specified use " +
  "case. The result must be photorealistic, credible, clean, warm, premium, and recognizably " +
  "Autivara in visual style without adding visible text, badges, or logos.";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function extension(path) {
  const i = path.lastIndexOf(".");
  return i >= 0 ? path.slice(i).toLowerCase() : "";
}

// Supplier folders commonly contain numbered gallery images. Prefer an explicit hero/primary
// image, then the first numbered image, then the largest remaining file. Generated derivatives
// are excluded so repeated runs always start from supplier truth, not from a prior AI edit.
export function selectProductImage(productDir) {
  if (!existsSync(productDir)) throw new Error(`Product image directory not found: ${productDir}`);
  const files = readdirSync(productDir)
    .filter((name) => IMAGE_EXTENSIONS.has(extension(name)))
    .filter((name) => !/(generated|branded|lifestyle|retouched|blog)/i.test(name))
    .map((name) => ({
      name,
      path: join(productDir, name),
      size: statSync(join(productDir, name)).size,
      preferred: /(^|[-_])(hero|primary|main|1)([-_.]|$)/i.test(name) ? 1 : 0,
    }))
    .sort((a, b) => b.preferred - a.preferred || b.size - a.size || a.name.localeCompare(b.name));
  if (!files.length) throw new Error(`No untouched supplier/product image found in ${productDir}`);
  return files[0].path;
}

function parseFlag(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}

async function main() {
  const [slug, ...rest] = process.argv.slice(2);
  const productHandle = parseFlag(rest, "--product");
  const useCase = parseFlag(rest, "--use-case");
  if (!slug || !productHandle || !useCase) {
    console.error(
      'Usage: node agents/content/generate-blog-image.mjs <slug> --product <product-handle> --use-case "<realistic scenario>"'
    );
    process.exit(1);
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(productHandle)) {
    throw new Error(`Invalid product handle "${productHandle}" — use lowercase letters, numbers, and hyphens only`);
  }

  const productDir = join(ROOT, "public", "products", productHandle);
  const refPath = selectProductImage(productDir);
  const ref = refPath.slice(ROOT.length + 1);

  const { OPENAI_API_KEY } = readEnv(["OPENAI_API_KEY"]);

  const outDir = join(ROOT, "public", "blog");
  const outPath = join(outDir, `${slug}.jpg`);
  if (existsSync(outPath)) {
    console.error(`FATAL: ${outPath} already exists — delete it first if you want to regenerate.`);
    process.exit(1);
  }

  const prompt = `${BRAND_STYLE} Article: ${slug.replace(/-/g, " ")}. Required real-world use case: ${useCase}`;
  console.log(`Selected existing product image "${ref}" for product "${productHandle}".`);
  console.log(`Transforming it for blog slug "${slug}"...`);
  console.log(`Prompt: ${prompt}\n`);

  const referenceImageBuffer = readFileSync(refPath);
  const imageBuffer = await editImage(OPENAI_API_KEY, referenceImageBuffer, basename(refPath), prompt);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, imageBuffer);

  console.log(`Saved → public/blog/${slug}.jpg (${(imageBuffer.length / 1024).toFixed(0)}KB)`);
  console.log(`Look at it before wiring it in. To use it, point lib/blog-image.ts's override map ` +
    `at "/blog/${slug}.jpg" for this slug.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
}
