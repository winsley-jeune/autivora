// Safe, surgical read/write for product-pipeline/catalog-novelty.json — the pre-sync source for
// Shopify product content (see product-pipeline/shopify-sync.mjs). A naive JSON.parse + edit +
// JSON.stringify round-trip is unsafe for this file: it hand-escapes non-ASCII as \uXXXX (native
// JSON.stringify doesn't), and it preserves trailing .0 on whole-number floats (24.0) which JS's
// number type silently drops on any parse/stringify round-trip. Either would produce a spurious
// full-file diff untouched fields included. Instead, every write here locates the exact product
// object as a text span and replaces only the named field's string value inside it — every other
// byte in the file, including sibling products and formatting, is untouched.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = join(__dir, "..", "..", "product-pipeline", "catalog-novelty.json");

// Finds every balanced {...} span in `text`, respecting JSON string literals (so a brace inside
// a string value never throws off nesting depth). Returns {start, end} pairs, end exclusive.
function findObjectSpans(text) {
  const spans = [];
  const stack = [];
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) { escaped = false; }
      else if (ch === "\\") { escaped = true; }
      else if (ch === '"') { inString = false; }
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "{") stack.push(i);
    else if (ch === "}") {
      const start = stack.pop();
      if (start !== undefined) spans.push({ start, end: i + 1 });
    }
  }
  return spans;
}

// Smallest object span containing a `"handle": "<handle>"` marker — the exact product object,
// not the file root or the enclosing products array.
function findProductSpan(text, handle) {
  const marker = `"handle": "${handle}"`;
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) throw new Error(`No product with handle "${handle}" found in catalog-novelty.json`);
  const spans = findObjectSpans(text)
    .filter((s) => s.start <= markerIndex && markerIndex < s.end)
    .sort((a, b) => (a.end - a.start) - (b.end - b.start));
  if (!spans.length) throw new Error(`Could not locate an enclosing object for handle "${handle}"`);
  return spans[0];
}

// Matches this file's own escaping convention: every codepoint above ASCII as \uXXXX.
function asciiEscape(str) {
  let out = "";
  for (const ch of JSON.stringify(str)) {
    const code = ch.codePointAt(0);
    out += code > 126 ? "\\u" + code.toString(16).padStart(4, "0") : ch;
  }
  return out.slice(1, -1); // strip JSON.stringify's own surrounding quotes — caller adds theirs
}

// Replaces one string field's value within `objectText`, preserving every other byte (including
// whitespace/indentation) exactly. Throws if the field isn't present as a plain string value —
// this module never adds new fields, only updates existing ones.
function replaceStringField(objectText, fieldName, newValue) {
  const re = new RegExp(`("${fieldName}"\\s*:\\s*")((?:[^"\\\\]|\\\\.)*)(")`);
  if (!re.test(objectText)) throw new Error(`Field "${fieldName}" not found as a string field in this product object`);
  return objectText.replace(re, (_, pre, _old, post) => pre + asciiEscape(newValue) + post);
}

// Read-only: the full parsed product object for `handle`, or throws if not found. Safe to use
// JSON.parse here since we're only reading, never round-tripping back to disk.
export function resolveCatalogProduct(handle) {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
  const product = catalog.products.find((p) => p.handle === handle);
  if (!product) throw new Error(`No product with handle "${handle}" found in catalog-novelty.json`);
  return product;
}

// Read-only: handle lookup by SKU (audit flows key on the Shopify variant SKU, not the handle).
// Returns null rather than throwing — callers decide whether an unknown SKU is an error.
export function resolveHandleBySku(sku) {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
  return catalog.products.find((p) => p.sku === sku)?.handle ?? null;
}

// Every other product sharing this product's `collection`, excluding itself — the real grounding
// an agent needs to write content that's genuinely distinct from its siblings, not just
// differently-worded. Returns the same fields resolveCatalogProduct would, per sibling.
export function getCollectionSiblings(handle) {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
  const product = catalog.products.find((p) => p.handle === handle);
  if (!product) throw new Error(`No product with handle "${handle}" found in catalog-novelty.json`);
  return catalog.products.filter((p) => p.handle !== handle && p.collection === product.collection);
}

// Replaces one numeric field's value within `objectText`, same byte-preserving contract as
// replaceStringField. Whole numbers are written with a trailing .0 to match this file's own
// convention for float fields (which JSON.parse would otherwise silently drop).
function replaceNumberField(objectText, fieldName, newValue) {
  const re = new RegExp(`("${fieldName}"\\s*:\\s*)(-?\\d+(?:\\.\\d+)?)`);
  if (!re.test(objectText)) throw new Error(`Field "${fieldName}" not found as a number field in this product object`);
  const formatted = Number.isInteger(Number(newValue)) ? `${Number(newValue)}.0` : String(Number(newValue));
  return objectText.replace(re, (_, pre) => pre + formatted);
}

// Surgical write: `fields` may include title, body_html, seo_title, seo_description, price
// (any subset) — the only fields catalog agents are allowed to touch. Applies each replacement
// in sequence against the same located span, writes the whole file back, then re-parses the
// result to confirm the write produced valid JSON and the new values round-trip exactly — the
// same verification the splice technique was validated with before this module existed.
const ALLOWED_STRING_FIELDS = ["title", "body_html", "seo_title", "seo_description"];
const ALLOWED_NUMBER_FIELDS = ["price"];

export function upsertCatalogProduct(handle, fields) {
  const unknown = Object.keys(fields).filter((k) => !ALLOWED_STRING_FIELDS.includes(k) && !ALLOWED_NUMBER_FIELDS.includes(k));
  if (unknown.length) throw new Error(`upsertCatalogProduct: not allowed to write field(s) ${unknown.join(", ")} — only ${[...ALLOWED_STRING_FIELDS, ...ALLOWED_NUMBER_FIELDS].join(", ")}`);

  const source = readFileSync(CATALOG_PATH, "utf8");
  const span = findProductSpan(source, handle);
  let objectText = source.slice(span.start, span.end);
  for (const [field, value] of Object.entries(fields)) {
    objectText = ALLOWED_NUMBER_FIELDS.includes(field)
      ? replaceNumberField(objectText, field, value)
      : replaceStringField(objectText, field, value);
  }
  const newSource = source.slice(0, span.start) + objectText + source.slice(span.end);

  const reparsed = JSON.parse(newSource); // throws if the splice produced invalid JSON
  const product = reparsed.products.find((p) => p.handle === handle);
  for (const [field, value] of Object.entries(fields)) {
    if (product[field] !== value) throw new Error(`upsertCatalogProduct: round-trip mismatch on "${field}" — write aborted`);
  }

  writeFileSync(CATALOG_PATH, newSource);
  return CATALOG_PATH;
}
