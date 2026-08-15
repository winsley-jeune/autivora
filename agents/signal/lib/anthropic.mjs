// Signal's structured-output call — see agents/lib/anthropic-fetch.mjs for the shared
// retry/forced-tool-call plumbing every agent's Claude call goes through.
import { callWithForcedTool } from "../../lib/anthropic-fetch.mjs";


export const SIGNAL_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    checkback_scores: {
      type: "array",
      items: {
        type: "object",
        properties: {
          task_id: { type: "integer" },
          outcome_score: { type: "number" },
          outcome_notes: { type: "string" },
        },
        required: ["task_id", "outcome_score", "outcome_notes"],
      },
    },
    lesson: { type: "string" },
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          agent: { type: "string", enum: ["ctr", "uplift", "linker", "envoy", "author", "social"] },
          action: { type: "string" },
          target_url: { type: "string" },
          target_query: { type: "string" },
          evidence: { type: "object" },
          hypothesis: { type: "string" },
          expected_effect: { type: "string" },
          priority: { type: "integer" },
          check_back_on: { type: "string" },
        },
        required: ["agent", "action", "target_url", "hypothesis", "expected_effect", "priority", "check_back_on"],
      },
    },
    daily_note: { type: "string" },
    sourcing_guidance: {
      type: "string",
      description: "OPTIONAL, most days empty. One short directive to Scout (the sourcing agent) ONLY when the funnel data changes what it should source or stop sourcing — e.g. a product page converting, a vein proven dead, a demand signal Scout can't see. It lands in Scout's lessons feed verbatim.",
    },
  },
  required: ["checkback_scores", "lesson", "tasks", "daily_note"],
};

export async function callSignal({ apiKey, systemPrompt, userInput }) {
  return callWithForcedTool({
    apiKey,
    systemPrompt,
    userContent: JSON.stringify(userInput, null, 2),
    tool: {
      name: "emit_signal_output",
      description: "Emit Signal's daily decision output: checkback scores, the lesson learned, today's tasks, and the operator note.",
      input_schema: SIGNAL_OUTPUT_SCHEMA,
    },
    label: "Signal",
  });
}
