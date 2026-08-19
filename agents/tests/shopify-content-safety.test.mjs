import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("Shopify product HTML contains no internal review payload", () => {
  const source = readFileSync(join(root, "dropship", "lib", "shopify.mjs"), "utf8");
  assert.equal(source.includes("<!-- internal review notes:"), false);
  assert.match(source, /body_html: copy\.body_html/);
});

test("content image client exposes no text-to-image generation endpoint", () => {
  const source = readFileSync(join(root, "content", "lib", "openai-image.mjs"), "utf8");
  assert.equal(source.includes("/v1/images/generations"), false);
  assert.equal(source.includes("export async function generateImage"), false);
});

test("autonomous Shopify publisher requires verification and implements rollback", () => {
  const source = readFileSync(join(root, "lib", "shopify-product-publisher.mjs"), "utf8");
  assert.match(source, /requirePassingVerification/);
  assert.match(source, /read-after-write/);
  assert.match(source, /status='rolled_back'/);
  assert.match(source, /status='rollback_failed'/);
});
