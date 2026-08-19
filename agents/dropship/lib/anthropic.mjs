// Scout's structured-output call — shared plumbing in agents/lib/anthropic-fetch.mjs.
// The schema IS the job description: for every import Scout must commit to a pricing-power
// judgment (what multiple the product commands and why), a competition read (who sells it,
// saturated or emerging), the marketing challenge, and channel eligibility (Amazon/TikTok/
// autivara-only) — merchandising decisions, not just product picking.
import { callWithForcedTool, callWithSearchThenTool, GENERATOR_MODEL, VERIFIER_MODEL } from "../../lib/anthropic-fetch.mjs";


// The demand-research pass (prompt-demand.md): live web search over observed market demand,
// emitting sourcing hypotheses with cited evidence. Runs only when the active-hypothesis pool
// is below target — a topping-up cost, not a per-run cost.
export const DEMAND_RESEARCH_SCHEMA = {
  type: "object",
  properties: {
    hypotheses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          hypothesis: { type: "string", description: "The demand claim: WHO buys WHAT, for WHAT occasion/need, right now" },
          demand_evidence: { type: "string", description: "What was OBSERVED via web search and where (site/listing/article) — velocity, trend, sold-out signals. Never speculation." },
          us_anchor_price: { type: "number", description: "Typical US retail observed for this object class; the pipeline caps landed cost at this /3" },
          anchor: { type: "string", enum: ["strong", "weak"], description: "strong = identical item findable on Amazon/Walmart in ~30s (usually disqualifying); weak = boutique/emerging/no direct comparable" },
          aliexpress_keywords: { type: "array", items: { type: "string" }, description: "2-4 supply-side search terms in supplier vocabulary to reverse-source this demand" },
          tier: { type: "string", enum: ["us-fast", "value-china"] },
          collection: { type: "string", enum: ["business", "home", "car"] },
        },
        required: ["hypothesis", "demand_evidence", "us_anchor_price", "anchor", "aliexpress_keywords", "tier", "collection"],
      },
    },
    retire_hypothesis_ids: {
      type: "array",
      items: { type: "string" },
      description: "ids of existing hypotheses whose scan yields prove them dead — retire decisively",
    },
    research_note: { type: "string", description: "<600 chars: what was observed this pass, for the operator digest" },
  },
  required: ["hypotheses", "retire_hypothesis_ids", "research_note"],
};

// PRE-IMPORT ANCHOR CHECK (run.mjs, before any draft is created): the 2026-08-08 fresh-eyes
// audit archived 28/28 dropship imports because identical units were findable on Amazon/
// Walmart in seconds — a check that must happen BEFORE import, not in a later audit. One
// web-search call per run covers every proposed import; a candidate only becomes a draft if
// no identical/near-identical unit undercuts its proposed price.
export const ANCHOR_CHECK_SCHEMA = {
  type: "object",
  properties: {
    checks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          itemId: { type: "string" },
          anchored: { type: "boolean", description: "true if an identical or near-identical unit is findable on Amazon/Walmart/eBay at or below the proposed price" },
          evidence: { type: "string", description: "What was searched and found: site, brand names it sells under, observed price range. Cite even for anchored=false (what you looked for and didn't find)." },
          anchor_price: { type: "number", description: "Lowest credible price found for the identical class; 0 if none found" },
        },
        required: ["itemId", "anchored", "evidence", "anchor_price"],
      },
    },
  },
  required: ["checks"],
};

const ANCHOR_CHECK_PROMPT = `You are a pre-import anchor checker for an e-commerce brand. For each proposed product
(title, proposed retail price, supplier photos described by title), search Amazon, Walmart,
and eBay for the IDENTICAL or near-identical unit — generic dropship goods typically sell
under multiple no-name brands. Be adversarial: your job is to find the anchor, not to clear
the import. A product is anchored if a buyer searching its obvious keywords would find the
same unit at or below the proposed price within ~30 seconds. Cite what you found (or what
you searched and did not find) for every item. History: 28 of 28 past imports that skipped
this check were later archived as anchored.`;

export async function callAnchorCheck({ apiKey, imports }) {
  return callWithSearchThenTool({
    apiKey,
    systemPrompt: ANCHOR_CHECK_PROMPT,
    userContent: JSON.stringify({ proposed_imports: imports }, null, 2),
    tool: {
      name: "emit_anchor_checks",
      description: "Emit the anchor-check verdicts for every proposed import.",
      input_schema: ANCHOR_CHECK_SCHEMA,
    },
    maxTokens: 8000,
    maxSearches: 12,
    label: "AnchorCheck",
  });
}

// Fresh-eyes catalog audit (audit-catalog.mjs): per-product verdicts from live market
// evidence, plus fully rebuilt listing assets. Deliberately fed no internal history.
export const CATALOG_AUDIT_SCHEMA = {
  type: "object",
  properties: {
    verdicts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number", description: "Shopify product id from the input, verbatim" },
          current_title: { type: "string" },
          current_price: { type: "number" },
          verdict: { type: "string", enum: ["keep_active", "reprice", "go_live", "archive"] },
          new_price: { type: "number", description: "Required when verdict is reprice; also set when go_live needs a different price than current" },
          rationale: { type: "string", description: "Concrete market evidence: sites searched, observed price ranges, anchor findings" },
          title: { type: "string", description: "Rebuilt customer-facing title (<=70 chars). Omit for archive." },
          body_html: { type: "string", description: "Truthful, product-specific customer-facing HTML description grounded only in supplied facts. Omit for archive." },
          seo_title: { type: "string", description: "<=60 chars. Omit for archive." },
          seo_description: { type: "string", description: "<=155 chars. Omit for archive." },
          image_alts: { type: "array", items: { type: "string" }, description: "One alt text per image, in position order (<=125 chars each). Omit for archive." },
        },
        required: ["id", "current_title", "current_price", "verdict", "rationale"],
      },
    },
    batch_note: { type: "string", description: "<400 chars: cross-product observations for this category batch" },
  },
  required: ["verdicts", "batch_note"],
};

export async function callCatalogAudit({ apiKey, systemPrompt, userInput }) {
  return callWithSearchThenTool({
    apiKey, model: GENERATOR_MODEL,
    systemPrompt,
    userContent: JSON.stringify(userInput, null, 2),
    tool: {
      name: "emit_audit_verdicts",
      description: "Emit the per-product audit verdicts with rebuilt listing assets and a batch note.",
      input_schema: CATALOG_AUDIT_SCHEMA,
    },
    maxTokens: 8000,
    maxSearches: 5,
    effort: "medium",
    label: "Audit",
  });
}

const CATALOG_VERIFICATION_SCHEMA = {
  type: "object",
  properties: {
    decisions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number" }, passed: { type: "boolean" },
          checks: {
            type: "object",
            properties: { factual: { type: "boolean" }, truthful: { type: "boolean" }, seo: { type: "boolean" }, economics: { type: "boolean" }, status_transition: { type: "boolean" } },
            required: ["factual", "truthful", "seo", "economics", "status_transition"],
          },
          notes: { type: "string" },
        },
        required: ["id", "passed", "checks", "notes"],
      },
    },
  },
  required: ["decisions"],
};

export async function callCatalogVerification({ apiKey, systemPrompt, userInput }) {
  return callWithForcedTool({
    apiKey, model: VERIFIER_MODEL, systemPrompt, userContent: JSON.stringify(userInput, null, 2),
    tool: { name: "verify_catalog_decisions", description: "Independently verify every proposed Shopify catalog mutation.", input_schema: CATALOG_VERIFICATION_SCHEMA },
    maxTokens: 4000, effort: "high", label: "CatalogVerifier",
  });
}

export async function callDemandResearch({ apiKey, systemPrompt, userInput }) {
  return callWithSearchThenTool({
    apiKey,
    systemPrompt,
    userContent: JSON.stringify(userInput, null, 2),
    tool: {
      name: "emit_demand_hypotheses",
      description: "Emit new evidence-backed demand hypotheses, retirements of dead ones, and a research note.",
      input_schema: DEMAND_RESEARCH_SCHEMA,
    },
    maxTokens: 16000,
    maxSearches: 15,
    label: "Scout/demand",
  });
}

export const SCOUT_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    lesson: {
      type: "string",
      description: "What this run's data taught about the sourcing strategy itself (keyword-space yields, tier economics, verification patterns) — written to memory for future runs",
    },
    imports: {
      type: "array",
      items: {
        type: "object",
        properties: {
          itemId: { type: "string" },
          collection: { type: "string", enum: ["business", "home", "car"] },
          price_multiple: { type: "number", description: "The multiple of landed cost this product can actually command (e.g. 20, 50, 100) given perceived value, competition, and channel" },
          pricing_rationale: { type: "string", description: "Why a customer would pay this multiple — perceived value, competitor pricing, novelty" },
          competition: { type: "string", description: "Who else sells this or close equivalents, how saturated, whether it's new/emerging or commodity" },
          marketing_angle: { type: "string", description: "The angle that sells it, and the main marketing challenge" },
          channel_eligibility: {
            type: "object",
            properties: {
              tiktok_shop: { type: "boolean" },
              amazon: { type: "boolean" },
              note: { type: "string", description: "Restrictions that gate channels: batteries, liquids/hazmat, third-party brand on the listing (IP risk), category gating" },
            },
            required: ["tiktok_shop", "amazon", "note"],
          },
          copy: {
            type: "object",
            properties: {
              title: { type: "string" },
              product_type: { type: "string" },
              seo_title: { type: "string" },
              seo_description: { type: "string" },
              body_html: { type: "string", description: "2 short paragraphs max; MUST include an honest 'Ships in X-Y days' line; never convert m³ nameplate specs to sq-ft claims" },
            },
            required: ["title", "product_type", "seo_title", "seo_description", "body_html"],
          },
        },
        required: ["itemId", "collection", "price_multiple", "pricing_rationale", "competition", "marketing_angle", "channel_eligibility", "copy"],
      },
    },
    rejects: {
      type: "array",
      items: {
        type: "object",
        properties: { itemId: { type: "string" }, reason: { type: "string" } },
        required: ["itemId", "reason"],
      },
    },
    keyword_expansions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tier: { type: "string", enum: ["us-fast", "value-china"] },
          keyword: { type: "string" },
          why: { type: "string" },
        },
        required: ["tier", "keyword", "why"],
      },
      description: "New keyword territory to scan on future runs — adjacent niches, angles the current queue misses. This is how the agent decides WHAT to source next.",
    },
    bundle_proposals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          component_item_ids: { type: "array", items: { type: "string" }, description: "2-4 itemIds drawn ONLY from this run's verified candidates and/or active catalog products" },
          collection: { type: "string", enum: ["business", "home", "car"] },
          price_multiple: { type: "number", description: "Multiple of the SUMMED component landed cost; floor is 3 (code-enforced) — propose what the composed offer genuinely commands" },
          rationale: { type: "string", description: "Why these components form a coherent offer and why a USA buyer pays this price for the SET" },
          copy: {
            type: "object",
            properties: {
              title: { type: "string" },
              product_type: { type: "string" },
              seo_title: { type: "string" },
              seo_description: { type: "string" },
              body_html: { type: "string" },
            },
            required: ["title", "product_type", "seo_title", "seo_description", "body_html"],
          },
        },
        required: ["title", "component_item_ids", "collection", "price_multiple", "rationale", "copy"],
      },
      description: "Anchor-free composite offers manufactured from verified components — the primary way to CREATE 7x-qualifying SKUs instead of hunting rare ones. Max 2 per run.",
    },
    market_band_updates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", description: "Band key from the market_bands input, or a new kebab-case key for a genuinely new category" },
          us_typical_price: { type: "number" },
          match: { type: "string", description: "Only for NEW categories: a case-insensitive regex of title terms" },
          anchor: { type: "string", enum: ["strong", "weak"] },
          rationale: { type: "string" },
        },
        required: ["category", "us_typical_price", "anchor", "rationale"],
      },
      description: "Corrections/additions to the market-price oracle from your US-market knowledge. These move the mechanical maxLanded sourcing caps — be conservative and evidence-based.",
    },
    catalog_flags: {
      type: "array",
      items: {
        type: "object",
        properties: { itemId: { type: "string" }, flag: { type: "string" } },
        required: ["itemId", "flag"],
      },
      description: "Existing catalog items needing operator attention (went stale, stock collapsed, should be paused/retired/repriced)",
    },
    daily_note: { type: "string", description: "Short operator-facing digest of what happened and what needs a human decision" },
  },
  required: ["lesson", "imports", "rejects", "keyword_expansions", "bundle_proposals", "market_band_updates", "catalog_flags", "daily_note"],
};

export async function callScout({ apiKey, systemPrompt, userInput }) {
  return callWithForcedTool({
    apiKey,
    systemPrompt,
    userContent: JSON.stringify(userInput, null, 2),
    tool: {
      name: "emit_scout_output",
      description: "Emit Scout's sourcing decisions: imports with full merchandising judgment, rejects, keyword expansions, catalog flags, lesson, and operator note.",
      input_schema: SCOUT_OUTPUT_SCHEMA,
    },
    maxTokens: 32000,
    label: "Scout",
  });
}
