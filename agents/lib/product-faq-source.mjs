// Loads the REAL productFaq() function straight from lib/product-faq.ts (transpiled in isolation,
// same technique as agents/lib/blog-source.mjs) so an agent can compute "what generic FAQ is this
// product currently falling back to" without hand-duplicating the collection templates — any
// future edit to the real templates is picked up automatically, no drift risk.
import ts from "typescript";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const LIB_DIR = join(__dir, "..", "..", "lib");

function transpile(filePath) {
  const source = readFileSync(filePath, "utf8");
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
}

// lib/product-faq.ts's only non-type import is `./brand` (brandName) — resolve it by hand rather
// than pulling in a bundler for one function.
export function loadProductFaqFn() {
  const brandModule = { exports: {} };
  new Function("module", "exports", transpile(join(LIB_DIR, "brand.ts")))(brandModule, brandModule.exports);

  const fakeRequire = (spec) => {
    if (spec === "./brand") return brandModule.exports;
    throw new Error(`loadProductFaqFn: unexpected import "${spec}" in product-faq.ts`);
  };
  const faqModule = { exports: {} };
  new Function("module", "exports", "require", transpile(join(LIB_DIR, "product-faq.ts")))(faqModule, faqModule.exports, fakeRequire);
  return faqModule.exports.productFaq;
}

// True if `handle` already has a real, product-specific override — i.e. this product was already
// enriched by a prior Product agent run. Read via the same transpile (not just string search) so
// it's exact, not a heuristic.
export function hasFaqOverride(handle) {
  const brandModule = { exports: {} };
  new Function("module", "exports", transpile(join(LIB_DIR, "brand.ts")))(brandModule, brandModule.exports);
  const fakeRequire = (spec) => {
    if (spec === "./brand") return brandModule.exports;
    throw new Error(`hasFaqOverride: unexpected import "${spec}" in product-faq.ts`);
  };
  const faqModule = { exports: {} };
  new Function("module", "exports", "require", transpile(join(LIB_DIR, "product-faq.ts")))(faqModule, faqModule.exports, fakeRequire);
  return Boolean(faqModule.exports.PRODUCT_FAQ_OVERRIDES[handle]);
}
