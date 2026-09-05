import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const packages = JSON.parse(readFileSync('product-pipeline/launches/autivara-publication-content-packages.json', 'utf8')).products;

test('prepared publication packages satisfy SEO, conversion, image, and delivery rules', () => {
  assert.equal(packages.length, 5);
  for (const product of packages) {
    assert.ok(product.seoTitle.length <= 60, `${product.handle} title too long`);
    assert.ok(product.seoDescription.length <= 160, `${product.handle} description too long`);
    assert.match(`${product.title} ${product.seoTitle} ${product.seoDescription}`.toLowerCase(), new RegExp(product.primaryKeyword.split(' ')[0], 'i'));
    assert.ok(product.descriptionHtml.length >= 400);
    assert.equal(product.images.length, 3);
    assert.ok(product.images.every(existsSync));
    assert.doesNotMatch(product.descriptionHtml, /\b(?:deliver(?:y|ed)?|ships?|arrives?)\b.{0,40}\b\d+\s*(?:business\s*)?(?:days?|weeks?)\b/i);
    assert.ok(product.internalLinks.length > 0);
  }
});
