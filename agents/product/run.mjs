#!/usr/bin/env node
// Product — fixes templated near-duplicate content on one product page: a genuinely distinct
// body_html/SEO title+description in product-pipeline/catalog-novelty.json, and a genuinely
// distinct FAQ in lib/product-faq.ts's PRODUCT_FAQ_OVERRIDES. Built to address the real defect
// found in agents/ARCHITECTURE.md's product-indexing investigation: every product in a collection
// shared the same FAQ template and near-identical short descriptions (only the name token
// varied), which correlated with only 4 of 18 product pages being indexed.
//
// Manual, per-handle, like agents/visual/run.mjs — not wired into Signal's automatic dispatch.
// This is one-time catalog-wide enrichment work, not an ongoing Signal-scored lane, so it uses
// the same task-store-agnostic "pseudo-task" trick Visual established: a plain object shaped
// like a Signal task, fed straight into the shared git-task-pr.mjs helpers.
//
// Usage:
//   node agents/product/run.mjs <handle>              # full pipeline, opens one PR
//   node agents/product/run.mjs <handle> --dry-run     # call Claude only — no write, no git
//
// IMPORTANT — two-step publish gate: this agent's PR only changes repo files. body_html/
// seo_title/seo_description live in catalog-novelty.json, which is just the pre-sync SOURCE for
// Shopify (see lib/shopify.ts's getProduct() — live product pages are fetched from Shopify's
// Storefront API, not this file). Merging this PR does NOT change the live product page. After
// merging, a human must separately run `node product-pipeline/shopify-sync.mjs --confirm` to
// actually push the new body/SEO to Shopify — deliberately never automatic. The FAQ change
// (lib/product-faq.ts) is real Next.js code and ships automatically on the next deploy after
// merge — no Shopify sync needed for that half.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readAiEnv } from "../lib/env.mjs";
import { resolveCatalogProduct, getCollectionSiblings, upsertCatalogProduct } from "../lib/catalog-source.mjs";
import { upsertRewriteEntry } from "../lib/blog-source.mjs";
import { loadProductFaqFn, hasFaqOverride } from "../lib/product-faq-source.mjs";
import { callProduct } from "./lib/anthropic.mjs";
import { startTaskBranch, finishTaskPR, abandonTaskBranch, assertCleanFor } from "../lib/git-task-pr.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..");
const CATALOG_PATH = "product-pipeline/catalog-novelty.json";
const FAQ_PATH = "lib/product-faq.ts";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const handle = args.find((a) => !a.startsWith("--"));

function git(cmdArgs) {
  return execFileSync("git", cmdArgs, { cwd: ROOT, encoding: "utf8" }).trim();
}

function typecheck() {
  try {
    execFileSync("npx", ["tsc", "--noEmit"], { cwd: ROOT, encoding: "utf8" });
    return { ok: true };
  } catch (e) {
    return { ok: false, output: (e.stdout ?? "") + (e.stderr ?? "") || e.message };
  }
}

(async () => {
  if (!handle) throw new Error("Usage: node agents/product/run.mjs <handle> [--dry-run]");
  const { ANTHROPIC_API_KEY } = readAiEnv();
  const systemPrompt = readFileSync(join(__dir, "prompt.md"), "utf8");

  if (!dryRun) assertCleanFor([CATALOG_PATH, FAQ_PATH], ROOT);

  let startBranch = null;
  let branchStarted = false;

  try {
    if (!dryRun) {
      ({ startBranch } = startTaskBranch({ id: handle, agent: "product" }, ROOT));
      branchStarted = true;
    }

    // Checked here (production's current content — the just-created origin/main-based task
    // branch for a real run, or whatever's locally checked out for --dry-run), never before the
    // branch switch: reading this off a stale local checkout is exactly the bug git-task-pr.mjs's
    // branch-before-read discipline exists to prevent (master and main sync only periodically,
    // so master's checkout can lack a scaffold export that's already live on main).
    if (hasFaqOverride(handle)) {
      throw new Error(`"${handle}" already has a PRODUCT_FAQ_OVERRIDES entry — already enriched. Remove it first if you want to regenerate.`);
    }

    const product = resolveCatalogProduct(handle);
    const siblings = getCollectionSiblings(handle).map((p) => ({
      handle: p.handle, title: p.title, tags: p.tags, body_html: p.body_html, seo_title: p.seo_title, seo_description: p.seo_description,
    }));
    const productFaq = loadProductFaqFn();
    // product-pipeline/shopify-sync.mjs appends `collection` onto the tags array at sync time
    // (tags: [...(p.tags || []), p.collection]) — the catalog file's own `tags` field never
    // includes it. productFaq()'s collection-template lookup keys off that tag, so without this
    // it would report the wrong (universal 2-question) fallback as "generic FAQ being replaced"
    // when the live page is actually showing the 4-question collection template.
    const genericFaq = productFaq({ handle: product.handle, title: product.title, tags: [...(product.tags ?? []), product.collection] });

    console.log(`Product: task → ${handle} (collection: ${product.collection}, ${siblings.length} sibling(s) for grounding)`);
    console.log("Product: calling configured AI model...");
    const { output, usage } = await callProduct({
      apiKey: ANTHROPIC_API_KEY,
      systemPrompt,
      product: {
        handle: product.handle, title: product.title, collection: product.collection, type: product.type,
        tags: product.tags, price: product.price, compare_at: product.compare_at,
        body_html: product.body_html, seo_title: product.seo_title, seo_description: product.seo_description,
      },
      siblings,
      genericFaq,
    });

    console.log(`\nchange_summary: ${output.change_summary}`);
    console.log(`body_html: ${output.body_html}`);
    console.log(`seo_title: ${output.seo_title}`);
    console.log(`seo_description: ${output.seo_description}`);
    console.log(`faq: ${output.faq.length} question(s)`);
    console.log(`usage: ${usage.input_tokens} in / ${usage.output_tokens} out / ${usage.cache_read_input_tokens} cache-read`);

    if (dryRun) {
      console.log("\n--dry-run: no write, no git.");
      return;
    }

    upsertCatalogProduct(handle, {
      body_html: output.body_html,
      seo_title: output.seo_title,
      seo_description: output.seo_description,
    });
    console.log(`Product: wrote ${CATALOG_PATH}.`);

    upsertRewriteEntry(handle, output.faq, join(ROOT, FAQ_PATH), "PRODUCT_FAQ_OVERRIDES");
    console.log(`Product: wrote ${FAQ_PATH}.`);

    console.log("Product: typechecking (npx tsc --noEmit)...");
    const check = typecheck();
    if (!check.ok) throw new Error(`tsc --noEmit failed:\n${check.output.slice(0, 2000)}`);
    console.log("Product: typecheck passed.");

    const pseudoTask = {
      id: handle,
      agent: "product",
      action: `De-duplicate product content for ${product.title}`,
      target_url: `/product/${handle}`,
      hypothesis: "Templated collection-level FAQ + near-identical short description read as duplicate content to Google, keeping this page unindexed.",
      expected_effect: "Genuinely distinct body/SEO/FAQ content clears the duplicate-content bar for indexing.",
      check_back_on: "n/a — manual enrichment, verify via Search Console index coverage after next crawl",
      evidence: { collection: product.collection, sibling_count: siblings.length },
    };

    const prUrl = finishTaskPR({
      task: pseudoTask,
      files: [CATALOG_PATH, FAQ_PATH],
      commitMessage: `product: de-duplicate content for ${handle}`,
      cwd: ROOT,
      startBranch,
    });
    console.log(`Product: opened PR → ${prUrl}`);
    console.log(`Product: REMINDER — merging this PR does not change the live Shopify page. After merge, run:`);
    console.log(`  node product-pipeline/shopify-sync.mjs --confirm`);
    console.log(`to push the new body_html/seo_title/seo_description live. The FAQ change ships automatically on next deploy.`);
  } catch (e) {
    if (branchStarted) {
      try { git(["checkout", "--", CATALOG_PATH, FAQ_PATH]); } catch {}
      try { git(["checkout", startBranch]); } catch {}
      abandonTaskBranch({ id: handle, agent: "product" }, ROOT);
    }
    console.error(`Product: FAILED for "${handle}".`);
    throw e;
  }
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
