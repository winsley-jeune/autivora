// Linker's structured-output call — see agents/lib/anthropic-fetch.mjs for the shared
// retry/forced-tool-call plumbing every agent's Claude call goes through.
import { callWithForcedTool } from "../../lib/anthropic-fetch.mjs";


export const LINKER_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    edits: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          slug: { type: "string", description: "Which candidate_source_pages entry this edits." },
          insert_after_index: { type: "integer", description: "Index in that page's content array to insert the new sentence after." },
          new_block: { type: "string", description: "The one new sentence, containing exactly one link to target_url with real anchor text." },
        },
        required: ["slug", "insert_after_index", "new_block"],
      },
    },
    change_summary: { type: "string" },
  },
  required: ["edits", "change_summary"],
};

export async function callLinker({ apiKey, systemPrompt, task, candidateSourcePages }) {
  const userContent = JSON.stringify(
    {
      task: { target_url: task.target_url, action: task.action, hypothesis: task.hypothesis, evidence: task.evidence },
      candidate_source_pages: candidateSourcePages,
    },
    null,
    2
  );
  return callWithForcedTool({
    apiKey,
    systemPrompt,
    userContent,
    tool: {
      name: "emit_linker_edits",
      description: "Emit the internal-link insertions for this task — one entry per source page being edited.",
      input_schema: LINKER_OUTPUT_SCHEMA,
    },
    maxTokens: 4000,
    label: "Linker",
  });
}
