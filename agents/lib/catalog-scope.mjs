import { createHash } from "node:crypto";

export function productScopeStatus(product) {
  const reasons = [];
  if (!product || !["active", "draft"].includes(product.status)) reasons.push("status_outside_managed_catalog");
  if (!product?.title?.trim()) reasons.push("missing_title");
  if (!product?.body_html?.trim()) reasons.push("missing_description");
  if (!product?.images?.length) reasons.push("missing_images");
  const purchasable = (product?.variants ?? []).filter((variant) => Number.isFinite(Number(variant.price)) && Number(variant.price) > 0);
  if (!purchasable.length) reasons.push("missing_purchasable_variant");
  const available = purchasable.some((variant) => variant.inventory_management == null || Number(variant.inventory_quantity) > 0);
  if (purchasable.length && !available) reasons.push("unavailable_inventory");
  return { managed: reasons.length === 0, reasons };
}

export function managedCatalogScope(snapshot) {
  if (!snapshot?.complete) throw new Error("Managed catalog scope requires a complete catalog snapshot");
  const products = [];
  const excluded = [];
  for (const product of snapshot.products) {
    const status = productScopeStatus(product);
    if (status.managed) products.push(product);
    else excluded.push({ id: product.id, status: product.status, title: product.title, reasons: status.reasons });
  }
  const hash = createHash("sha256").update(JSON.stringify(products)).digest("hex");
  return { hash, products, excluded, managedCount: products.length, excludedCount: excluded.length };
}
