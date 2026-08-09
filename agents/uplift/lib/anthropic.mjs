// Uplift's structured-output call — see agents/lib/anthropic-fetch.mjs for the shared
// retry/forced-tool-call plumbing every agent's Claude call goes through.
import { callWithForcedTool } from "../../lib/anthropic-fetch.mjs";


export const UPLIFT_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    content: { type: "array", items: { type: "string" }, description: "The full replacement content array — every markdown block, in order." },
    read_time: { type: "string", description: "e.g. '6 min read' — only change this if the word count shifted meaningfully." },
    change_summary: { type: "string" },
  },
  required: ["content", "read_time", "change_summary"],
};

export async function callUplift({ apiKey, systemPrompt, task, article, catalog, competitorGrounding }) {
  const userContent = JSON.stringify({ task, article, catalog, competitor_grounding: competitorGrounding ?? null }, null, 2);
  return callWithForcedTool({
    apiKey,
    systemPrompt,
    userContent,
    tool: {
      name: "emit_uplift_content",
      description: "Emit the updated body content for this blog post, implementing Signal's task.",
      input_schema: UPLIFT_OUTPUT_SCHEMA,
    },
    maxTokens: 8000,
    label: "Uplift",
  });
}
