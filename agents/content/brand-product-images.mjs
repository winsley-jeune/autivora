#!/usr/bin/env node
// Converts an ARRAY of existing supplier images into a coherent Autivara product image set.
// Every output is an edit of one real input image. Supplier originals are never overwritten and
// there is deliberately no text-to-image fallback.
//
// Manifest shape:
// [
//   { "path": "public/products/<handle>/supplier-main.jpg", "role": "main" },
//   { "path": "public/products/<handle>/supplier-detail.jpg", "role": "gallery" },
//   { "path": "public/products/<handle>/supplier-car.jpg", "role": "lifestyle",
//     "use_case": "A daily commuter using the product during the morning drive" }
// ]
//
// Usage:
//   node agents/content/brand-product-images.mjs \
//     --product <handle> \
//     --images-file <path/to/image-manifest.json> \
//     --audience "United States"
//
// Writes new files to public/products/<handle>/autivara/. Supplier files remain untouched.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, dirname, extname, join, resolve, sep } from "node:path";
import { readEnv } from "../lib/env.mjs";
import { editImage } from "./lib/openai-image.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..");
const VALID_ROLES = new Set(["main", "gallery", "lifestyle"]);
const VALID_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function parseFlag(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}

function assertInsideRoot(path) {
  const absolute = resolve(path);
  const root = resolve(ROOT) + sep;
  if (!absolute.startsWith(root)) throw new Error(`Image must be inside the project: ${path}`);
  return absolute;
}

function validateManifest(images) {
  if (!Array.isArray(images) || !images.length) throw new Error("Image manifest must be a non-empty array");
  return images.map((image, index) => {
    if (!image || typeof image.path !== "string") throw new Error(`Image ${index + 1} requires a path`);
    const role = image.role ?? "gallery";
    if (!VALID_ROLES.has(role)) throw new Error(`Image ${index + 1} has invalid role "${role}"`);
    const sourcePath = assertInsideRoot(join(ROOT, image.path));
    if (!existsSync(sourcePath)) throw new Error(`Image ${index + 1} not found: ${sourcePath}`);
    if (!VALID_EXTENSIONS.has(extname(sourcePath).toLowerCase())) throw new Error(`Image ${index + 1} has an unsupported format`);
    if (role === "lifestyle" && !image.use_case?.trim()) {
      throw new Error(`Lifestyle image ${index + 1} requires a specific use_case`);
    }
    return { ...image, role, sourcePath };
  });
}

const PRODUCT_TRUTH =
  "The supplied image is the source of truth. Preserve the exact physical product: shape, " +
  "proportions, colors, materials, controls, openings, included accessories, packaging structure, " +
  "and branding already printed on it. Do not invent, redesign, relabel, replace, or add features " +
  "to the product. Do not add an Autivara logo to the physical item unless it is already present.";

const CLEANUP =
  "Convert the generic Alibaba marketplace presentation into polished Autivara commercial " +
  "photography. Improve lighting, color accuracy, composition, sharpness, shadows, and background. " +
  "Remove marketplace badges, seller graphics, decorative callouts, watermarks, awkward collage " +
  "elements, nonessential Chinese-language promotional overlays, and visual clutter. Do not invent " +
  "a translation, performance claim, certification, discount, review, or feature. Use no added " +
  "headline, caption, badge, or promotional text in the output.";

function roleInstruction(image, audience) {
  if (image.role === "main") {
    return "Create a clean primary e-commerce image: one clear hero product, neutral warm-white " +
      "studio background, realistic soft shadow, centered premium composition, and no props that " +
      "obscure the product.";
  }
  if (image.role === "gallery") {
    return "Create a supporting gallery image. Preserve the detail, angle, component, or feature " +
      "shown in the source while giving it consistent Autivara lighting and art direction. Keep " +
      "the image factual and easy to understand without text overlays.";
  }
  return `Create credible lifestyle photography for customers in ${audience}. Keep the real ` +
    `product and the source image's essential use intact, but localize the environment, people, ` +
    `homes, vehicles, clothing, objects, measurements, and visual cues so they feel natural and ` +
    `contemporary for that market—not like a copied overseas marketplace advertisement. Avoid ` +
    `stereotypes and exaggerated luxury. Required use case: ${image.use_case.trim()}`;
}

export function buildTransformationPrompt(image, { productHandle, audience = "United States" }) {
  return [
    `Product: ${productHandle}. Image role: ${image.role}.`,
    PRODUCT_TRUTH,
    CLEANUP,
    roleInstruction(image, audience),
    "Final style: photorealistic, warm, refined, trustworthy, culturally natural, and consistent " +
      "with a premium American automotive and home-fragrance storefront.",
  ].join(" ");
}

export async function brandProductImages({ apiKey, productHandle, images, audience = "United States" }) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(productHandle)) throw new Error(`Invalid product handle "${productHandle}"`);
  const validated = validateManifest(images);
  const outDir = join(ROOT, "public", "products", productHandle, "autivara");
  mkdirSync(outDir, { recursive: true });

  const outputs = [];
  for (let i = 0; i < validated.length; i++) {
    const image = validated[i];
    const prompt = buildTransformationPrompt(image, { productHandle, audience });
    const number = String(i + 1).padStart(2, "0");
    const outPath = join(outDir, `${number}-${image.role}.jpg`);
    if (existsSync(outPath)) throw new Error(`Output already exists: ${outPath}`);

    console.log(`[${i + 1}/${validated.length}] ${image.role}: ${image.path}`);
    const input = readFileSync(image.sourcePath);
    const output = await editImage(apiKey, input, basename(image.sourcePath), prompt);
    writeFileSync(outPath, output);
    outputs.push({ source: image.path, role: image.role, output: outPath.slice(ROOT.length + 1) });
    console.log(`  saved -> ${outputs.at(-1).output}`);
  }
  return outputs;
}

async function main() {
  const args = process.argv.slice(2);
  const productHandle = parseFlag(args, "--product");
  const manifestPathArg = parseFlag(args, "--images-file");
  const audience = parseFlag(args, "--audience") ?? "United States";
  if (!productHandle || !manifestPathArg) {
    console.error("Usage: node agents/content/brand-product-images.mjs --product <handle> --images-file <manifest.json> [--audience \"United States\"]");
    process.exit(1);
  }

  const manifestPath = assertInsideRoot(join(ROOT, manifestPathArg));
  const images = JSON.parse(readFileSync(manifestPath, "utf8"));
  const { OPENAI_API_KEY } = readEnv(["OPENAI_API_KEY"]);
  const outputs = await brandProductImages({ apiKey: OPENAI_API_KEY, productHandle, images, audience });
  console.log(`\nCreated ${outputs.length} branded derivative(s). Review every image before publishing.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => { console.error("FATAL:", error.message); process.exit(1); });
}
