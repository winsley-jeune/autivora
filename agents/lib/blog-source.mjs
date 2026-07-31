// Reads and edits blog article data straight from the TypeScript source files (lib/blog-*.ts)
// without importing the module graph — these files are plain data literals with only
// `import type` dependencies (erased at compile time), so each can be extracted and evaluated
// in isolation via the TypeScript compiler API, with zero cross-file import resolution needed.
// Safer than regex/brace-counting (survives nested braces/quotes inside content strings) and
// far lighter than spinning up a bundler just to read a JSON-shaped literal.
import ts from "typescript";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const LIB_DIR = join(__dir, "..", "..", "lib");
const REWRITES_FILE = join(LIB_DIR, "blog-rewrites.ts");

// Precedence matches lib/blog-data.ts's own BLOG_ARTICLES assembly (rewrites always win by
// design — that's the whole point of blog-rewrites.ts) followed by its source spread order.
const SOURCE_FILES = [
  { file: "blog-demand-wave1.ts", varName: "DEMAND_WAVE1" },
  { file: "blog-demand-wave2.ts", varName: "DEMAND_WAVE2" },
  { file: "blog-demand-wave3.ts", varName: "DEMAND_WAVE3" },
  { file: "blog-demand-wave4.ts", varName: "DEMAND_WAVE4" },
  { file: "blog-demand-wave5.ts", varName: "DEMAND_WAVE5" },
  { file: "blog-demand-wave6.ts", varName: "DEMAND_WAVE6" },
  { file: "blog-demand-wave7.ts", varName: "DEMAND_WAVE7" },
  { file: "blog-guides.ts", varName: "BUYING_GUIDES" },
  { file: "blog-batch4.ts", varName: "BATCH4_ARTICLES" },
  { file: "blog-competitive.ts", varName: "COMPETITIVE_ARTICLES" },
  { file: "blog-data.ts", varName: "CORE_ARTICLES" },
];

// Finds a top-level `const <varName> = <literal>` (or `export const`) and evaluates just its
// initializer in isolation — no other statement in the file is touched or executed.
function extractDeclaration(filePath, varName) {
  const source = readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);
  let initializer = null;
  ts.forEachChild(sf, (child) => {
    if (ts.isVariableStatement(child)) {
      for (const decl of child.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === varName && decl.initializer) {
          initializer = decl.initializer;
        }
      }
    }
  });
  if (!initializer) return null;

  const literalText = initializer.getText(sf);
  const { outputText } = ts.transpileModule(`module.exports = ${literalText};`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const moduleObj = { exports: {} };
  new Function("module", "exports", outputText)(moduleObj, moduleObj.exports);
  return moduleObj.exports;
}

// Returns { article, hasOverride } for `slug`, or null if the slug doesn't exist anywhere.
// hasOverride tells the caller whether it'll be replacing an existing blog-rewrites.ts entry
// or inserting a brand-new one.
export function resolveArticle(slug) {
  const rewrites = extractDeclaration(REWRITES_FILE, "BLOG_REWRITES");
  if (rewrites && rewrites[slug]) {
    return { article: rewrites[slug], hasOverride: true };
  }
  for (const src of SOURCE_FILES) {
    const arr = extractDeclaration(join(LIB_DIR, src.file), src.varName);
    const found = arr?.find((a) => a.slug === slug);
    if (found) return { article: found, hasOverride: false };
  }
  return null;
}

// Looks up `slug` in the SOURCE_FILES only, bypassing BLOG_REWRITES entirely — for when an SEO
// rewrite has replaced an article that started life as one of the sourced competitor-research
// pieces (lib/blog-competitive.ts in particular: real prices, cited against the competitor's own
// product pages, "verified <date>"). A rewrite optimizing title/meta/structure for a specific
// query can accidentally drop that sourced data along the way — this is how an executor recovers
// it as grounding, instead of estimating competitor pricing from general knowledge. Returns null
// if the slug has no pre-rewrite source version (i.e. it was authored directly into
// BLOG_REWRITES, or resolveArticle's hasOverride is false and this would just be a duplicate).
export function resolveOriginalArticle(slug) {
  for (const src of SOURCE_FILES) {
    const arr = extractDeclaration(join(LIB_DIR, src.file), src.varName);
    const found = arr?.find((a) => a.slug === slug);
    if (found) return { article: found, sourceFile: src.file };
  }
  return null;
}

// Inserts or replaces `key`'s entry in an exported `Record<string, T>`-shaped object literal
// (BLOG_REWRITES by default; pass `varName` to target a different one, e.g. lib/product-faq.ts's
// PRODUCT_FAQ_OVERRIDES), touching nothing else in the file — an AST-located, range-based text
// splice (not a full-file regenerate), so every other hand-written entry stays byte-identical.
// Serialized via JSON.stringify: valid TS object-literal syntax (JSON is a strict subset), just
// double-quoted rather than matching the file's single-quoted style — a cosmetic difference an
// eslint/prettier pass can normalize, not a correctness issue.
export function upsertRewriteEntry(key, value, filePath = REWRITES_FILE, varName = "BLOG_REWRITES") {
  const source = readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);

  let objectLiteral = null;
  ts.forEachChild(sf, (child) => {
    if (ts.isVariableStatement(child)) {
      for (const decl of child.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === varName && decl.initializer && ts.isObjectLiteralExpression(decl.initializer)) {
          objectLiteral = decl.initializer;
        }
      }
    }
  });
  if (!objectLiteral) throw new Error(`Could not find ${varName} object literal in ${filePath}`);

  let existingProp = null;
  for (const prop of objectLiteral.properties) {
    if (ts.isPropertyAssignment(prop)) {
      const keyText = prop.name.getText(sf).replace(/^['"]|['"]$/g, "");
      if (keyText === key) existingProp = prop;
    }
  }

  const serialized = JSON.stringify(value, null, 2);
  const entry = `${JSON.stringify(key)}: ${serialized},`;

  let newSource;
  if (existingProp) {
    const start = existingProp.getStart(sf);
    let end = existingProp.getEnd();
    if (source[end] === ",") end += 1; // PropertyAssignment doesn't include its own trailing comma
    newSource = source.slice(0, start) + entry + source.slice(end);
  } else {
    const insertPos = objectLiteral.getStart(sf) + 1; // right after the object literal's '{'
    newSource = source.slice(0, insertPos) + `\n  ${entry}\n` + source.slice(insertPos);
  }

  writeFileSync(filePath, newSource);
  return filePath;
}
