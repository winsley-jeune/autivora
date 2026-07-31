// Shared raw-fetch helper for every agent's Claude calls — matches the hand-rolled style already
// used for Google/Shopify auth in this repo (see agents/analytics/lib/google-auth.mjs) rather
// than pulling in the SDK. `callWithForcedTool` forces a single tool call so the response is
// always valid JSON matching the given schema — no free-text parsing, ever.
const API_URL = "https://api.anthropic.com/v1/messages";
const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUS = new Set([429, 500, 529]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// A raw fetch call gets none of the SDK clients' automatic retry — without this, a single
// transient 429/5xx/overloaded_error on a daily cron silently costs a whole day of an agent's
// run (no decision, no execution) until the next scheduled attempt.
async function postWithRetry(url, options, label) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, options);
    if (!RETRYABLE_STATUS.has(res.status) || attempt === MAX_ATTEMPTS) return res;

    const retryAfter = Number(res.headers.get("retry-after"));
    const backoffMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : 2 ** attempt * 1000 + Math.random() * 500; // 2s/4s + jitter
    console.warn(`${label}: Anthropic API returned ${res.status} (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${Math.round(backoffMs)}ms...`);
    await sleep(backoffMs);
  }
}

// `tool` is a full tool definition ({name, description, input_schema}); the call is forced onto
// it via tool_choice, so `output` is always that schema, never free text needing a JSON-fence
// parse. Forced tool_choice + adaptive thinking together is fine on the first-party Claude API
// (this call) and Vertex AI — the "thinking must be disabled with forced tool_choice" restriction
// is Bedrock-only. If this ever 400s, the full response body is surfaced via the thrown error.
export async function callWithForcedTool({ apiKey, model, systemPrompt, userContent, tool, maxTokens = 8000, effort = "high", label = "agent" }) {
  const body = {
    model,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    output_config: { effort },
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userContent }],
    tools: [tool],
    tool_choice: { type: "tool", name: tool.name },
  };

  const res = await postWithRetry(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  }, label);
  const json = await res.json();
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${JSON.stringify(json)}`);
  if (json.stop_reason === "refusal") throw new Error(`${label} call refused: ${JSON.stringify(json.stop_details)}`);

  const toolUse = json.content.find((b) => b.type === "tool_use" && b.name === tool.name);
  if (!toolUse) throw new Error(`No ${tool.name} tool call in response: ${JSON.stringify(json.content)}`);
  return { output: toolUse.input, usage: json.usage };
}
