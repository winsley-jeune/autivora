import test from "node:test";
import assert from "node:assert/strict";
import { managedCatalogScope, productScopeStatus } from "../lib/catalog-scope.mjs";

const complete = { id: 1, status: "active", title: "Diffuser", body_html: "<p>Facts</p>", images: [{ id: 1 }], variants: [{ price: 39, inventory_management: null, inventory_quantity: 0 }] };

test("managed scope includes complete sellable products", () => {
  assert.equal(productScopeStatus(complete).managed, true);
});

test("managed scope quarantines incomplete and unavailable products", () => {
  assert.deepEqual(productScopeStatus({ ...complete, id: 2, status: "draft", images: [], variants: [{ price: 20, inventory_management: "shopify", inventory_quantity: 0 }] }).reasons, ["missing_images", "unavailable_inventory"]);
  const scope = managedCatalogScope({ complete: true, products: [complete, { ...complete, id: 3, status: "archived" }] });
  assert.equal(scope.managedCount, 1);
  assert.equal(scope.excludedCount, 1);
});
