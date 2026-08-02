// Herald's structured-output call — standard forced tool (no web search needed).
import { callWithForcedTool } from "../../lib/anthropic-fetch.mjs";

const MODEL = "claude-opus-4-8";

export const HERALD_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    posts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          platform: { type: "string", enum: ["pinterest", "instagram", "facebook", "facebook-group", "tiktok-photo"] },
          subject_url: { type: "string", description: "The real product or article path this post is about" },
          title: { type: "string", description: "Pinterest: keyword-rich pin title. Instagram: unused (empty string)." },
          caption: { type: "string", description: "Pinterest: ~300-char keyword-rich description. Instagram: hook-first caption with line breaks." },
          hashtags: { type: "array", items: { type: "string" } },
          link_url: { type: "string", description: "Full https URL with utm_source/<platform>, utm_medium=social, utm_campaign=herald" },
          image_url: { type: "string", description: "One of the REAL image URLs provided in inputs" },
          needs_retouch: { type: "boolean" },
          rationale: { type: "string" },
        },
        required: ["platform", "subject_url", "title", "caption", "hashtags", "link_url", "image_url", "needs_retouch", "rationale"],
      },
    },
    lesson: { type: "string" },
    daily_note: { type: "string" },
  },
  required: ["posts", "lesson", "daily_note"],
};

export async function callHerald({ apiKey, systemPrompt, userInput }) {
  return callWithForcedTool({
    apiKey,
    model: MODEL,
    systemPrompt,
    userContent: JSON.stringify(userInput, null, 2),
    tool: {
      name: "emit_social_drafts",
      description: "Emit the social post drafts for operator approval, plus lesson and operator note.",
      input_schema: HERALD_OUTPUT_SCHEMA,
    },
    maxTokens: 12000,
    label: "Herald",
  });
}
