// Product's structured-output call — see agents/lib/anthropic-fetch.mjs for the shared
// retry/forced-tool-call plumbing every agent's Claude call goes through.
import { callWithForcedTool } from "../../lib/anthropic-fetch.mjs";


export const PRODUCT_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    body_html: { type: "string", description: "One <p> hook sentence + <ul><li> bullets (2-4), matching the site's existing product body_html pattern exactly." },
    seo_title: { type: "string", description: "'Autivara <Name> | <specific mechanism/benefit>', under ~65 characters." },
    seo_description: { type: "string", description: "One sentence, under ~160 characters." },
    faq: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
      },
      description: "2-4 questions genuinely specific to this product, not the collection template.",
    },
    change_summary: { type: "string" },
  },
  required: ["body_html", "seo_title", "seo_description", "faq", "change_summary"],
};

export async function callProduct({ apiKey, systemPrompt, product, siblings, genericFaq }) {
  const userContent = JSON.stringify({ product, siblings, generic_faq_being_replaced: genericFaq }, null, 2);
  return callWithForcedTool({
    apiKey,
    systemPrompt,
    userContent,
    tool: {
      name: "emit_product_content",
      description: "Emit the updated product content — body_html, seo_title, seo_description, and a product-specific FAQ.",
      input_schema: PRODUCT_OUTPUT_SCHEMA,
    },
    maxTokens: 4000,
    label: "Product",
  });
}
