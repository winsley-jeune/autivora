// Shared raw-fetch helper for every agent's Claude calls — matches the hand-rolled style already
// used for Google/Shopify auth in this repo (see agents/analytics/lib/google-auth.mjs) rather
// than pulling in the SDK. `callWithForcedTool` forces a single tool call so the response is
// always valid JSON matching the given schema — no free-text parsing, ever.
const API_URL = "https://api.anthropic.com/v1/messages";
import { assertAnthropicBudget, estimatedAnthropicCost, recordAnthropicUsage } from "./ai-budget.mjs";
import { readOptionalEnv } from "./env.mjs";
import { callOllamaStructured, OLLAMA_MODEL } from './ollama-fetch.mjs';
import { googleShoppingProducts, serpTop } from './dataforseo.mjs';
// Routine generation uses the efficient model; only explicitly routed high-risk verification
// receives Opus. Environment overrides make model migrations configuration-only.
const modelEnv = readOptionalEnv(["AI_PROVIDER", "ANTHROPIC_OPUS_MODEL", "ANTHROPIC_GENERATOR_MODEL", "ANTHROPIC_VERIFIER_MODEL"]);
export const AI_PROVIDER = process.env.AI_PROVIDER ?? modelEnv.AI_PROVIDER ?? 'ollama';
export const OPUS_MODEL = AI_PROVIDER === 'ollama' ? OLLAMA_MODEL : process.env.ANTHROPIC_OPUS_MODEL ?? modelEnv.ANTHROPIC_OPUS_MODEL ?? "claude-opus-4-8";
export const GENERATOR_MODEL = AI_PROVIDER === 'ollama' ? OLLAMA_MODEL : process.env.ANTHROPIC_GENERATOR_MODEL ?? modelEnv.ANTHROPIC_GENERATOR_MODEL ?? "claude-sonnet-4-6";
export const VERIFIER_MODEL = AI_PROVIDER === 'ollama' ? OLLAMA_MODEL : process.env.ANTHROPIC_VERIFIER_MODEL ?? modelEnv.ANTHROPIC_VERIFIER_MODEL ?? OPUS_MODEL;
export const MODEL = GENERATOR_MODEL;
const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUS = new Set([429, 500, 529]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nonRetryableRequest = (error) => /Anthropic API error 4(?!29)\d|invalid_request_error|credit balance is too low/i.test(error?.message ?? "");

export function compactResearchPlanInput(input, maxChars = 16_000) {
  const text = typeof input === 'string' ? input : JSON.stringify(input);
  if (text.length <= maxChars) return text;
  const half = Math.floor((maxChars - 80) / 2);
  return `${text.slice(0, half)}\n...[middle omitted for search-query planning]...\n${text.slice(-half)}`;
}

// A raw fetch call gets none of the SDK clients' automatic retry — without this, a single
// transient 429/5xx/overloaded_error on a daily cron silently costs a whole day of an agent's
// run (no decision, no execution) until the next scheduled attempt.
async function postWithRetry(url, options, label) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let res;
    try {
      res = await fetch(url, { ...options, signal: AbortSignal.timeout(5 * 60 * 1000) });
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw error;
      const backoffMs = 2 ** attempt * 1000 + Math.random() * 500;
      console.warn(`${label}: network error (${error.message.slice(0, 100)}) on attempt ${attempt}/${MAX_ATTEMPTS}, retrying in ${Math.round(backoffMs)}ms...`);
      await sleep(backoffMs);
      continue;
    }
    if (!RETRYABLE_STATUS.has(res.status) || attempt === MAX_ATTEMPTS) return res;

    const retryAfter = Number(res.headers.get("retry-after"));
    const backoffMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : 2 ** attempt * 1000 + Math.random() * 500; // 2s/4s + jitter
    console.warn(`${label}: Anthropic API returned ${res.status} (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${Math.round(backoffMs)}ms...`);
    await sleep(backoffMs);
  }
}

// Like callWithForcedTool, but the model first researches with the SERVER-SIDE web-search tool
// (searches execute inside Anthropic's infra within this single request — no scraping stack,
// no search-API keys) and then finishes by calling the structured output tool. tool_choice must
// stay "auto" for the search phase, so the output tool isn't API-guaranteed — one nudge turn
// recovers the case where the model stops after researching without emitting.
export async function callWithSearchThenTool({ apiKey, model = MODEL, systemPrompt, userContent, tool, maxTokens = 16000, maxSearches = 12, effort = "high", label = "agent" }) {
  if (AI_PROVIDER === 'ollama') {
    const querySchema = { type: 'object', properties: {
      queries: { type: 'array', minItems: 1, maxItems: Math.min(maxSearches, 6), items: { type: 'string' } },
    }, required: ['queries'] };
    const { output: plan } = await callOllamaStructured({
      model,
      label: `${label}/research-plan`,
      maxTokens: 800,
      systemPrompt: 'Create concise Google search queries for the entities, products, prices, publications, or contacts in the request. Do not answer the request. Never search for meta-instructions such as current, live, organic result, evidence, or Google itself; search the underlying subject directly. Never use site:google.com.',
      userContent: compactResearchPlanInput(userContent),
      schema: querySchema,
      contextTokens: 8192,
    });
    const queries = [...new Set(plan.queries.map((query) => query.trim()).filter(Boolean))].slice(0, Math.min(maxSearches, 6));
    const research = await Promise.all(queries.map(async (query) => ({
      query,
      organic: await serpTop(query, { limit: 5 }),
      ...(/anchor/i.test(label) ? { shopping: await googleShoppingProducts(query, { depth: 10, maxPolls: 8 }) } : {}),
    })));
    if (!research.some((item) => item.organic?.length || item.shopping?.length)) {
      throw new Error(`${label}: DataForSEO returned no live evidence; refusing ungrounded output`);
    }
    return callOllamaStructured({
      model,
      label,
      maxTokens,
      systemPrompt: `${systemPrompt}\nUse only the supplied live_research for current web facts. Cite exact URLs from it. If evidence is insufficient, return an empty result rather than guessing.`,
      userContent: JSON.stringify({ request: userContent, live_research: research }, null, 2),
      schema: tool.input_schema,
    });
  }
  assertAnthropicBudget(estimatedAnthropicCost({ model, inputText: `${systemPrompt}\n${userContent}`, maxTokens, maxSearches }));
  const tools = [{ type: "web_search_20260209", name: "web_search", max_uses: maxSearches }, tool];
  const baseBody = {
    model,
    max_tokens: maxTokens,
    stream: true, // search-heavy calls run many minutes; a non-streaming response sends zero bytes until done and trips socket idle timeouts (real ETIMEDOUT on Envoy's first run)
    thinking: { type: "adaptive" },
    output_config: { effort },
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    tools,
  };
  const headers = { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" };

  let messages = [{ role: "user", content: userContent }];
  for (let attempt = 1; attempt <= 3; attempt++) {
    let msg;
    try {
      msg = await streamMessage(API_URL, headers, { ...baseBody, messages }, label);
    } catch (e) {
      if (nonRetryableRequest(e)) throw e;
      if (attempt < 3) {
        console.warn(`${label}: network/stream error (${e.message.slice(0, 80)}), retrying (${attempt}/3)...`);
        await sleep(2 ** attempt * 2000);
        continue;
      }
      throw e;
    }
    if (msg.stop_reason === "refusal") throw new Error(`${label} call refused`);
    const toolUse = msg.content.find((b) => b.type === "tool_use" && b.name === tool.name);
    if (toolUse) {
      const costUsd = recordAnthropicUsage({ model, usage: msg.usage, maxSearches, label });
      return { output: toolUse.input, usage: msg.usage, costUsd };
    }
    // Model researched but stopped without emitting — nudge once with the same conversation.
    messages = [...messages, { role: "assistant", content: msg.content }, { role: "user", content: `Now emit your final structured output by calling the ${tool.name} tool exactly once.` }];
  }
  throw new Error(`${label}: no ${tool.name} tool call in response after retries`);
}

// Minimal SSE accumulator for the Messages streaming API: rebuilds { content, stop_reason,
// usage } from the event stream. Handles text deltas and tool_use input_json deltas; other
// block types (server_tool_use, web_search results, thinking) are carried through untouched
// so assistant-content can be replayed in a follow-up turn.
async function streamMessage(url, headers, body, label) {
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text.slice(0, 500)}`);
  }
  const blocks = [];
  const jsonAccum = {}; // index -> partial_json string for tool_use blocks
  let stopReason = null;
  let usage = null;
  let buffer = "";
  const decoder = new TextDecoder();
  for await (const chunk of res.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let sep;
    while ((sep = buffer.indexOf("\n\n")) >= 0) {
      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const dataLine = rawEvent.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      let ev;
      try { ev = JSON.parse(dataLine.slice(5).trim()); } catch { continue; }
      switch (ev.type) {
        case "content_block_start":
          blocks[ev.index] = structuredClone(ev.content_block);
          if (ev.content_block.type === "tool_use") jsonAccum[ev.index] = "";
          break;
        case "content_block_delta":
          if (ev.delta.type === "text_delta") blocks[ev.index].text = (blocks[ev.index].text ?? "") + ev.delta.text;
          else if (ev.delta.type === "input_json_delta") jsonAccum[ev.index] += ev.delta.partial_json;
          else if (ev.delta.type === "thinking_delta") blocks[ev.index].thinking = (blocks[ev.index].thinking ?? "") + ev.delta.thinking;
          else if (ev.delta.type === "signature_delta") blocks[ev.index].signature = (blocks[ev.index].signature ?? "") + ev.delta.signature;
          break;
        case "content_block_stop":
          if (blocks[ev.index]?.type === "tool_use" && jsonAccum[ev.index]) {
            try { blocks[ev.index].input = JSON.parse(jsonAccum[ev.index]); } catch { /* leave start-event input */ }
          }
          break;
        case "message_delta":
          stopReason = ev.delta?.stop_reason ?? stopReason;
          usage = ev.usage ?? usage;
          break;
        case "error":
          throw new Error(`${label}: stream error event: ${JSON.stringify(ev.error).slice(0, 300)}`);
      }
    }
  }
  return { content: blocks.filter(Boolean), stop_reason: stopReason, usage };
}

// `tool` is a full tool definition ({name, description, input_schema}); the call is forced onto
// it via tool_choice, so `output` is always that schema, never free text needing a JSON-fence
// parse. Forced tool_choice + adaptive thinking together is fine on the first-party Claude API
// (this call) and Vertex AI — the "thinking must be disabled with forced tool_choice" restriction
// is Bedrock-only. If this ever 400s, the full response body is surfaced via the thrown error.
export async function callWithForcedTool({ apiKey, model = MODEL, systemPrompt, userContent, tool, maxTokens = 8000, effort = "high", label = "agent" }) {
  if (AI_PROVIDER === 'ollama') {
    return callOllamaStructured({ model, systemPrompt, userContent, schema: tool.input_schema, maxTokens, label });
  }
  assertAnthropicBudget(estimatedAnthropicCost({ model, inputText: `${systemPrompt}\n${userContent}`, maxTokens }));
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
  const costUsd = recordAnthropicUsage({ model, usage: json.usage, label });
  return { output: toolUse.input, usage: json.usage, costUsd };
}
