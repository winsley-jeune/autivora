import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregate, attributionChannel } from '../analytics/shopify.mjs';

test('Shopify order attribution recognizes search and AI sources', () => {
  assert.equal(attributionChannel({ landing_site: '/products/a?utm_source=google&utm_medium=organic' }), 'organic_search');
  assert.equal(attributionChannel({ referring_site: 'https://www.bing.com/search?q=diffuser' }), 'organic_search');
  assert.equal(attributionChannel({ referring_site: 'https://chatgpt.com/' }), 'ai_assistant');
  assert.equal(attributionChannel({}), 'unknown');
});

test('Shopify aggregate exposes attributable organic revenue', () => {
  const report = aggregate([
    { id: 1, created_at: '2026-08-30T12:00:00Z', total_price: '39', currency: 'USD', landing_site: '/auto?utm_source=google', line_items: [] },
    { id: 2, created_at: '2026-08-30T13:00:00Z', total_price: '20', currency: 'USD', line_items: [] },
  ], new Set());
  assert.equal(report.orderCount, 2);
  assert.equal(report.organicOrderCount, 1);
  assert.equal(report.organicRevenue, 39);
  assert.equal(report.attributionCoverage, 0.5);
});
