// Visual's two Claude calls: plan (pick a real product + scene) and verify (confirm the
// rendered image didn't misrepresent the product). Both run at effort "high", not cost-cut —
// a bad plan wastes the entire downstream OpenAI image spend, and a lax verification defeats the
// one purpose the check exists for. Budget discipline for this agent lives in NOT calling
// GPT-image-2 wastefully (refuse-to-overwrite, one-at-a-time, retry-on-failure instead of
// shipping something wrong) — never in reasoning less carefully about quality/safety.
import { callWithForcedTool } from "../../lib/anthropic-fetch.mjs";


export const VISUAL_PLAN_SCHEMA = {
  type: "object",
  properties: {
    product_handle: { type: "string" },
    reference_image_index: { type: "integer", minimum: 1 },
    scene: { type: "string", description: "What surrounds the product — never a change to the product itself." },
    rationale: { type: "string" },
  },
  required: ["product_handle", "reference_image_index", "scene", "rationale"],
};

export async function planVisual({ apiKey, systemPrompt, article, targetQuery, catalog }) {
  const userContent = JSON.stringify({ article, target_query: targetQuery ?? null, catalog }, null, 2);
  return callWithForcedTool({
    apiKey,
    systemPrompt,
    userContent,
    tool: {
      name: "emit_visual_plan",
      description: "Emit the reference product, photo index, and scene for this blog post's hero image.",
      input_schema: VISUAL_PLAN_SCHEMA,
    },
    maxTokens: 2000,
    effort: "high",
    label: "Visual (plan)",
  });
}

const VERIFY_SCHEMA = {
  type: "object",
  properties: {
    product_preserved: { type: "boolean", description: "True only if the generated image shows the exact same product — same shape, color, material, and branding — as the reference." },
    discrepancies: { type: "array", items: { type: "string" }, description: "Specific differences found, if any. Empty if product_preserved is true." },
    notes: { type: "string" },
  },
  required: ["product_preserved", "discrepancies", "notes"],
};

const VERIFY_SYSTEM_PROMPT = `You are verifying a generated marketing image against the real reference product photo it was supposed to recontextualize into a new scene. Compare the two images carefully: shape, color, material, proportions, and any visible branding or distinguishing features. The scene/background/lighting are EXPECTED to differ — that's the point of the recontextualization. What must NOT differ is the product itself. Flag any redesign, invented feature, wrong color, or altered proportions as a discrepancy, however small. Default to product_preserved: false if you are not confident they show the same physical object — a false "verified" here would let a misrepresented product reach the live site.`;

export async function verifyVisual({ apiKey, referenceImageBase64, referenceMediaType, generatedImageBase64 }) {
  const userContent = [
    { type: "text", text: "Reference photo (the real product):" },
    { type: "image", source: { type: "base64", media_type: referenceMediaType, data: referenceImageBase64 } },
    { type: "text", text: "Generated image (recontextualized into a new scene):" },
    { type: "image", source: { type: "base64", media_type: "image/jpeg", data: generatedImageBase64 } },
    { type: "text", text: "Does the generated image show the exact same product as the reference photo?" },
  ];
  return callWithForcedTool({
    apiKey,
    systemPrompt: VERIFY_SYSTEM_PROMPT,
    userContent,
    tool: {
      name: "emit_verification",
      description: "Emit whether the generated image preserved the real product's exact appearance.",
      input_schema: VERIFY_SCHEMA,
    },
    maxTokens: 1500,
    effort: "high",
    label: "Visual (verify)",
  });
}
