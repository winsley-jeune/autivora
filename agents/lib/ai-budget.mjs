import { costToday, recordCost } from "./store-state.mjs";
import { openDb } from "./db.mjs";
import { readOptionalEnv } from "./env.mjs";

const DEFAULT_DAILY_USD = 1.5;
const DEFAULT_MONTHLY_USD = 15;
const budgetEnv = readOptionalEnv(["AI_DAILY_BUDGET_USD", "AI_MONTHLY_BUDGET_USD"]);

function rates(model) {
  return /opus/i.test(model) ? { input: 15, output: 75 } : /sonnet/i.test(model) ? { input: 3, output: 15 } : { input: 1, output: 5 };
}

export function estimatedAnthropicCost({ model, inputText = "", maxTokens = 0, maxSearches = 0 }) {
  const price = rates(model);
  const inputTokens = Math.ceil(String(inputText).length / 4);
  return Number(((inputTokens / 1e6) * price.input + (maxTokens / 1e6) * price.output + maxSearches * 0.01).toFixed(6));
}

export function aiCostThisMonth(now = new Date()) {
  const month = now.toISOString().slice(0, 7);
  return Number(openDb().prepare("SELECT COALESCE(SUM(amount_usd),0) total FROM cost_events WHERE substr(occurred_at,1,7)=? AND kind='ai'").get(month).total);
}

export function assertAnthropicBudget(estimatedUsd, now = new Date()) {
  const dailyLimit = Number(process.env.AI_DAILY_BUDGET_USD ?? budgetEnv.AI_DAILY_BUDGET_USD ?? DEFAULT_DAILY_USD);
  const monthlyLimit = Number(process.env.AI_MONTHLY_BUDGET_USD ?? budgetEnv.AI_MONTHLY_BUDGET_USD ?? DEFAULT_MONTHLY_USD);
  const daily = costToday("ai", now);
  const monthly = aiCostThisMonth(now);
  if (daily + estimatedUsd > dailyLimit) throw new Error(`AI daily budget gate: $${daily.toFixed(4)} used + $${estimatedUsd.toFixed(4)} reserved exceeds $${dailyLimit.toFixed(2)}`);
  if (monthly + estimatedUsd > monthlyLimit) throw new Error(`AI monthly budget gate: $${monthly.toFixed(4)} used + $${estimatedUsd.toFixed(4)} reserved exceeds $${monthlyLimit.toFixed(2)}`);
  return { daily, monthly, dailyLimit, monthlyLimit };
}

export function recordAnthropicUsage({ model, usage = {}, maxSearches = 0, label }) {
  const price = rates(model);
  const input = Number(usage.input_tokens ?? 0);
  const cacheWrite = Number(usage.cache_creation_input_tokens ?? 0);
  const cacheRead = Number(usage.cache_read_input_tokens ?? 0);
  const output = Number(usage.output_tokens ?? 0);
  const searches = Number(usage.server_tool_use?.web_search_requests ?? maxSearches ?? 0);
  const amountUsd = (input * price.input + cacheWrite * price.input * 1.25 + cacheRead * price.input * 0.1 + output * price.output) / 1e6 + searches * 0.01;
  recordCost({ kind: "ai", amountUsd, detail: { provider: "anthropic", model, label, input, output, cacheWrite, cacheRead, searches } });
  return amountUsd;
}
