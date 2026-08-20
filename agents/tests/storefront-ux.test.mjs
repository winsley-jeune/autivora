import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');

test('product CTA bypasses the oil modal when no oils are purchasable', () => {
  const source = read('components/UpsellModal.tsx');
  assert.match(source, /oils\.length \? setOpen\(true\) : handleConfirm\(false\)/);
  assert.match(source, /if \(!added\) \{[\s\S]*setError\('We could not add this item/);
  assert.doesNotMatch(source, /finally \{[\s\S]*setCartOpen\(true\)/);
});

test('future diffuser and oil upsells use one atomic cart mutation', () => {
  const upsell = read('components/UpsellModal.tsx');
  const actions = read('app/actions/cart.ts');
  assert.match(upsell, /addCartItems\(\[\{ variantId, quantity: 1 \}, \.\.\.selectedOils\]\)/);
  assert.match(actions, /addToCart\(cart\.id, lines\)/);
});

test('product pages preserve structured Shopify description HTML', () => {
  const source = read('app/product/[handle]/page.tsx');
  assert.match(source, /product\.descriptionHtml/);
  assert.match(source, /dangerouslySetInnerHTML=\{\{ __html: product\.descriptionHtml \}\}/);
});

test('cart errors are exposed to shoppers', () => {
  const context = read('components/cart/cart-context.tsx');
  const drawer = read('components/cart/CartDrawer.tsx');
  assert.match(context, /cartError: string \| null/);
  assert.match(context, /setCartError\(message\)/);
  assert.match(drawer, /role="alert"/);
});

test('every cart response includes analytics product fields and guards missing data', () => {
  const shopify = read('lib/shopify.ts');
  const context = read('components/cart/cart-context.tsx');
  const operations = [...shopify.matchAll(/query:\s*`([\s\S]*?)`/g)]
    .map((match) => match[1])
    .filter((query) => /(?:mutation|query)\s+(?:cart|getCart)/i.test(query));
  assert.ok(operations.length > 0, 'expected cart GraphQL operations');
  for (const operation of operations) {
    const products = operation.match(/\bproduct\s*\{/g) ?? [];
    assert.ok(products.length > 0, 'each cart operation must select product data');
    assert.equal((operation.match(/\btags\b/g) ?? []).length, products.length);
    assert.equal((operation.match(/\bpriceRange\s*\{/g) ?? []).length, products.length);
  }
  assert.match(context, /if \(!money\) continue/);
});

test('recrawl candidates exclude quarantined routes and stale sitemap URLs', () => {
  const source = read('agents/analytics/reindex.mjs');
  assert.match(source, /currentUrls\.has\(u\)/);
  const moneyPath = source.match(/const MONEY_PATH = (\/\^.*?\/);/)?.[1] ?? '';
  assert.doesNotMatch(moneyPath, /scents|home\\\/|industrial\|/);
});

test('quick add is not nested inside the product link and remains visible on touch', () => {
  const source = read('components/ProductCard.tsx');
  assert.match(source, /<article/);
  assert.match(source, /translate-y-0 md:translate-y-full/);
  const imageLinkClose = source.indexOf('</Link>');
  const quickAdd = source.indexOf('<QuickAddButton');
  assert.ok(imageLinkClose > -1 && quickAdd > imageLinkClose);
});

test('primary navigation does not promote the unavailable scent catalog', () => {
  const header = read('components/Header.tsx');
  const layout = read('app/layout.tsx');
  assert.doesNotMatch(header, /label: 'Scents'/);
  assert.doesNotMatch(layout, /label: 'Scents'/);
});

test('overlays use modal semantics and shared keyboard focus management', () => {
  const cart = read('components/cart/CartDrawer.tsx');
  const upsell = read('components/UpsellModal.tsx');
  const hook = read('components/useDialogAccessibility.ts');
  assert.match(cart, /aria-modal="true"/);
  assert.match(upsell, /aria-modal="true"/);
  assert.match(hook, /event\.key === 'Escape'/);
  assert.match(hook, /event\.key !== 'Tab'/);
  assert.match(hook, /previousFocus\?\.focus\(\)/);
});
