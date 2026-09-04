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
    if (/mutation\s+cart/i.test(operation)) {
      assert.match(operation, /userErrors \{ code field message \}/);
    }
  }
  assert.match(context, /if \(!money\) continue/);
});

test('cart actions validate identifiers, secure the cookie, and surface Shopify user errors', () => {
  const actions = read('app/actions/cart.ts');
  const shopify = read('lib/shopify.ts');
  const drawer = read('components/cart/CartDrawer.tsx');
  assert.match(actions, /httpOnly: true/);
  assert.match(actions, /sameSite: 'lax'/);
  assert.match(actions, /isVariantId/);
  assert.match(actions, /isLineId/);
  assert.match(shopify, /requireCartMutation/);
  assert.match(shopify, /const API_VERSION = '2026-07'/);
  assert.match(drawer, /safeCheckoutUrl/);
  assert.match(drawer, /Checkout Unavailable/);
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

test('shared customer surfaces do not publish universal legacy catalog claims', () => {
  const about = read('app/about/page.tsx');
  const faq = read('app/faq/page.tsx');
  const blogPage = read('app/blog/[slug]/page.tsx');
  const productFaq = read('lib/product-faq.ts');
  assert.doesNotMatch(about, /No proprietary|refill it with any Autivara oil|reply within one business day/);
  assert.doesNotMatch(faq, /there are no proprietary pods|You can use any quality|reply within one business day/);
  assert.doesNotMatch(blogPage, /Zero residue|without heat, water, or chemicals/);
  assert.match(productFaq, /Product FAQ publication is paused/);
  assert.match(productFaq, /return \[\];/);
});

test('published blog data filters unverified product-specific claim blocks', () => {
  const source = read('lib/blog-data.ts');
  assert.match(source, /function containsUnverifiedCatalogClaim/);
  assert.match(source, /content: article\.content\.filter\(\(block\) => !containsUnverifiedCatalogClaim\(block\)\)/);
  assert.match(source, /\.map\(publicationSafe\)/);
});

test('blog heroes rotate across topic-specific product image pools', () => {
  const source = read('lib/blog-image.ts');
  assert.match(source, /const CAR_IMAGES = \[/);
  assert.match(source, /const HOME_IMAGES = \[/);
  assert.match(source, /const COMMERCIAL_IMAGES = \[/);
  assert.match(source, /stableIndex\(article\.slug, pool\.length\)/);
  assert.ok(
    (source.match(/\.\.\.productImages\(/g) ?? []).length >= 15,
    'blog fallbacks should use the catalog, not three shared product photos',
  );
});

test('every blog article receives a tracked product recommendation', () => {
  const recommendations = read('lib/blog-product.ts');
  const articlePage = read('app/blog/[slug]/page.tsx');
  assert.match(recommendations, /export function blogProduct/);
  assert.match(recommendations, /utm_source=blog/);
  assert.match(recommendations, /\/product\/\$\{product\.handle\}/);
  assert.match(articlePage, /const recommendedProduct = blogProduct\(article\)/);
  assert.match(articlePage, /aria-label="Recommended product"/);
  assert.match(articlePage, /href=\{recommendedProduct\.href/);
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
