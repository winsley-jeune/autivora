#!/usr/bin/env node
// Generates a unique blog header image by recontextualizing a REAL Autivara product photo into
// a new scene via OpenAI's gpt-image-2 edit endpoint — preserves the actual product's real
// appearance instead of inventing a generic diffuser. Replaces the current setup where dozens of
// blog posts share just 3 stock product photos (lib/blog-image.ts).
//
// Costs real money per call (~$0.02-$0.21/image) — this is a one-at-a-time tool, not a silent
// bulk job, so each image gets a human look before wider rollout.
//
// Usage:
//   node agents/content/generate-blog-image.mjs <slug> --ref <path/to/real-product-photo.jpg> --scene "<specific scenario for THIS article>"
//
// Example:
//   node agents/content/generate-blog-image.mjs why-does-my-car-smell-musty \
//     --ref public/products/autivora-rechargeable-car-diffuser/autivora-rechargeable-car-diffuser-1.jpg \
//     --scene "the same real diffuser mounted on the vent of an older, slightly worn car interior on a rainy day, addressing a musty-smell problem — same device, different real-world context"
//
// Writes to: public/blog/<slug>.jpg
// Requires .env: OPENAI_API_KEY
// Setup: see agents/content/README.md
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";
import { readEnv } from "./lib/env.mjs";
import { editImage } from "./lib/openai-image.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..");

const BRAND_STYLE =
  "Premium editorial product photography for a luxury automotive/home fragrance brand called " +
  "Autivara. Keep the product in the reference image EXACTLY as it appears — same shape, color, " +
  "material, and branding — do not redesign or reimagine the product itself. Only change the " +
  "surrounding scene/context. Photorealistic, soft natural light, no visible added text or logos.";

function parseFlag(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}

async function main() {
  const [slug, ...rest] = process.argv.slice(2);
  const ref = parseFlag(rest, "--ref");
  const scene = parseFlag(rest, "--scene");
  if (!slug || !ref || !scene) {
    console.error(
      'Usage: node agents/content/generate-blog-image.mjs <slug> --ref <path/to/real-product-photo.jpg> --scene "<specific scenario>"'
    );
    process.exit(1);
  }

  const refPath = join(ROOT, ref);
  if (!existsSync(refPath)) {
    console.error(`FATAL: reference image not found at ${refPath}`);
    process.exit(1);
  }

  const { OPENAI_API_KEY } = readEnv(["OPENAI_API_KEY"]);

  const outDir = join(ROOT, "public", "blog");
  const outPath = join(outDir, `${slug}.jpg`);
  if (existsSync(outPath)) {
    console.error(`FATAL: ${outPath} already exists — delete it first if you want to regenerate.`);
    process.exit(1);
  }

  const prompt = `${BRAND_STYLE} New scene: ${scene}`;
  console.log(`Editing reference "${ref}" for slug "${slug}"...`);
  console.log(`Prompt: ${prompt}\n`);

  const referenceImageBuffer = readFileSync(refPath);
  const imageBuffer = await editImage(OPENAI_API_KEY, referenceImageBuffer, basename(refPath), prompt);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, imageBuffer);

  console.log(`Saved → public/blog/${slug}.jpg (${(imageBuffer.length / 1024).toFixed(0)}KB)`);
  console.log(`Look at it before wiring it in. To use it, point lib/blog-image.ts's override map ` +
    `at "/blog/${slug}.jpg" for this slug.`);
}

main().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
