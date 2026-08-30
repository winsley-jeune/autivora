import { callWithForcedTool } from '../../lib/anthropic-fetch.mjs';

export const COLLECTION_OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    heading: { type: 'string' },
    intro: { type: 'string' },
    comparison: { type: 'object', properties: {
      columns: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
      rows: { type: 'array', items: { type: 'array', items: { type: 'string' } }, minItems: 2, maxItems: 8 },
    }, required: ['columns', 'rows'] },
    chooser: { type: 'array', minItems: 2, maxItems: 6, items: { type: 'object', properties: {
      title: { type: 'string' }, body: { type: 'string' }, href: { type: 'string' },
    }, required: ['title', 'body', 'href'] } },
    faqs: { type: 'array', minItems: 2, maxItems: 6, items: { type: 'object', properties: {
      question: { type: 'string' }, answer: { type: 'string' },
    }, required: ['question', 'answer'] } },
    change_summary: { type: 'string' },
  },
  required: ['heading', 'intro', 'comparison', 'chooser', 'faqs', 'change_summary'],
};

export function callCollection({ apiKey, task, existing, catalog }) {
  return callWithForcedTool({ apiKey, label: 'Collection', maxTokens: 6000,
    systemPrompt: `You improve one ecommerce collection page from a Signal task. Return structured, concise buying content that helps a shopper choose and buy. Implement the task exactly. Use only product titles, handles, prices, and facts supplied in catalog. Never invent competitor prices, coverage, specifications, guarantees, or test results. Every chooser href must be a supplied /product/<handle> route. Comparison row width must equal the columns width. Avoid unsupported universal claims.`,
    userContent: JSON.stringify({ task, existing, catalog }, null, 2),
    tool: { name: 'emit_collection_content', description: 'Emit grounded commercial collection content.', input_schema: COLLECTION_OUTPUT_SCHEMA },
  });
}
