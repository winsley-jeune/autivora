import test from "node:test";
import assert from "node:assert/strict";
import { estimatedAnthropicCost } from "../lib/ai-budget.mjs";

test("Sonnet generation is materially cheaper than Opus for the same request", () => {
  const sonnet = estimatedAnthropicCost({ model: "claude-sonnet", inputText: "x".repeat(4000), maxTokens: 8000, maxSearches: 5 });
  const opus = estimatedAnthropicCost({ model: "claude-opus", inputText: "x".repeat(4000), maxTokens: 8000, maxSearches: 5 });
  assert.ok(opus > sonnet * 3);
});
