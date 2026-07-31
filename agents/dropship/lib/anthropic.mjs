// Scout's structured-output call — shared plumbing in agents/lib/anthropic-fetch.mjs.
// The schema IS the job description: for every import Scout must commit to a pricing-power
// judgment (what multiple the product commands and why), a competition read (who sells it,
// saturated or emerging), the marketing challenge, and channel eligibility (Amazon/TikTok/
// autivara-only) — merchandising decisions, not just product picking.
import { callWithForcedTool } from "../../lib/anthropic-fetch.mjs";

const MODEL = "claude-opus-4-8";

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
  required: ["lesson", "imports", "rejects", "keyword_expansions", "catalog_flags", "daily_note"],
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
