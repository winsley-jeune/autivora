import test from 'node:test';
import assert from 'node:assert/strict';
import { assertSchema, ollamaUserMessage } from '../lib/ollama-fetch.mjs';
import { AI_PROVIDER, GENERATOR_MODEL } from '../lib/anthropic-fetch.mjs';
import { compactPromptInputs } from '../signal/lib/compact-inputs.mjs';

const schema = {
  type: 'object',
  properties: {
    decisions: { type: 'array', minItems: 1, items: { type: 'object', properties: {
      id: { type: 'integer' }, passed: { type: 'boolean' },
    }, required: ['id', 'passed'] } },
  },
  required: ['decisions'],
};

test('local AI schema guard accepts valid structured output', () => {
  assert.doesNotThrow(() => assertSchema({ decisions: [{ id: 1, passed: true }] }, schema));
});

test('local AI schema guard rejects incomplete or wrongly typed output', () => {
  assert.throws(() => assertSchema({ decisions: [{ id: '1' }] }, schema), /must be an integer|required/);
});

test('Anthropic-style image content is normalized for Ollama vision messages', () => {
  assert.deepEqual(ollamaUserMessage([
    { type: 'text', text: 'reference' },
    { type: 'image', source: { data: 'abc' } },
  ]), { role: 'user', content: 'reference', images: ['abc'] });
});

test('agent AI compatibility layer defaults to the installed local model', () => {
  assert.equal(AI_PROVIDER, 'ollama');
  assert.equal(GENERATOR_MODEL, 'qwen3.5:9b');
});

test('Signal compaction keeps decisions but drops inactive catalog bulk', () => {
  const compact = compactPromptInputs({
    open_tasks: [{ id: 1, status: 'open', agent: 'linker', action: 'x'.repeat(1000), evidence: { bulk: 'x'.repeat(1000) } }],
    outcome_history: { mean_by_action: { linker: 0.2 }, recent: Array.from({ length: 30 }, (_, id) => ({ id, action: 'done' })) },
    competitor_intel: { keywords: Array.from({ length: 80 }, (_, id) => ({ id })) },
    product_economics: { products: [{ status: 'active', id: 1 }, { status: 'archived', id: 2 }] },
    unindexed_pages: { pages: Array.from({ length: 80 }, (_, id) => ({ id })) },
  });
  assert.equal(compact.open_tasks[0].action.length, 350);
  assert.equal(compact.outcome_history.recent.length, 10);
  assert.equal(compact.competitor_intel.keywords.length, 20);
  assert.deepEqual(compact.product_economics.products.map((item) => item.id), [1]);
  assert.equal(compact.unindexed_pages.pages.length, 60);
});
