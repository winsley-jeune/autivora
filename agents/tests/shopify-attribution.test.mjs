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

test('Shopify aggregate attributes refunds to the affected product', () => {
  const report = aggregate([{ id:3,created_at:'2026-08-30T12:00:00Z',total_price:'50',currency:'USD',line_items:[{product_id:9,title:'Offer',price:'50',quantity:1}],refunds:[{refund_line_items:[{quantity:1,subtotal:50,line_item:{product_id:9,title:'Offer'}}]}] }],new Set());
  assert.equal(report.refundedOrderCount,1);
  assert.equal(report.refundAmount,50);
  assert.equal(report.topProducts[0].refundedQuantity,1);
});
