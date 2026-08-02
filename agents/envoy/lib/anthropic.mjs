// Envoy's research+emit call — server-side web search then structured output; shared plumbing
// in agents/lib/anthropic-fetch.mjs (callWithSearchThenTool).
import { callWithSearchThenTool } from "../../lib/anthropic-fetch.mjs";

const MODEL = "claude-opus-4-8";

export const ENVOY_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    targets: {
      type: "array",
      items: {
        type: "object",
        properties: {
          task_id: { type: "integer" },
          asset_url: { type: "string" },
          target_url: { type: "string", description: "A URL actually seen in search results — never invented" },
          site_name: { type: "string" },
          why_them: { type: "string", description: "Specific: what THEY published that makes this asset relevant to their readers" },
          contact_method: { type: "string", description: "Found email / contact form URL / reddit reply / 'unknown — operator to locate'. Never fabricated." },
          pitch_subject: { type: "string" },
          pitch_body: { type: "string", description: "Under 150 words, founder-voice, value-first; for forums: a disclosed, genuinely helpful comment draft" },
          followup_days: { type: "integer", description: "Suggested days before one polite follow-up; 0 = no follow-up appropriate (e.g. forum posts)" },
        },
        required: ["task_id", "asset_url", "target_url", "site_name", "why_them", "contact_method", "pitch_subject", "pitch_body", "followup_days"],
      },
    },
    lesson: { type: "string" },
    daily_note: { type: "string" },
  },
  required: ["targets", "lesson", "daily_note"],
};

export async function callEnvoy({ apiKey, systemPrompt, userInput }) {
  return callWithSearchThenTool({
    apiKey,
    model: MODEL,
    systemPrompt,
    userContent: JSON.stringify(userInput, null, 2),
    tool: {
      name: "emit_outreach_drafts",
      description: "Emit the qualified outreach targets with personalized pitch drafts, the lesson, and the operator note.",
      input_schema: ENVOY_OUTPUT_SCHEMA,
    },
    maxSearches: 14,
    label: "Envoy",
  });
}
