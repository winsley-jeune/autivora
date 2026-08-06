// Scout's structured-output call — shared plumbing in agents/lib/anthropic-fetch.mjs.
// The schema IS the job description: for every import Scout must commit to a pricing-power
// judgment (what multiple the product commands and why), a competition read (who sells it,
// saturated or emerging), the marketing challenge, and channel eligibility (Amazon/TikTok/
// autivara-only) — merchandising decisions, not just product picking.
import { callWithForcedTool, callWithSearchThenTool } from "../../lib/anthropic-fetch.mjs";

const MODEL = "claude-opus-4-8";

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

export async function callDemandResearch({ apiKey, systemPrompt, userInput }) {
  return callWithSearchThenTool({
    apiKey,
    model: MODEL,
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
    model: MODEL,
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
