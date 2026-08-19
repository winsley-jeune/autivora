// Deterministic gates around model-generated catalog decisions. These checks are independent of
// prose quality and cannot be waived by either the generator or verifier.
export function buildCatalogPatch(product, verdict, { requireSeoEvidence = false, catalogHash = null, now = new Date() } = {}) {
  if (String(product.id) !== String(verdict.id)) throw new Error("Catalog verdict targets the wrong product");
  if (!verdict.rationale || verdict.rationale.length < 40) throw new Error("Catalog verdict lacks concrete rationale");
  if (verdict.verdict === "archive") return { status: "archived" };
  if (!["keep_active", "reprice", "go_live"].includes(verdict.verdict)) throw new Error(`Unsupported catalog verdict ${verdict.verdict}`);
  if (verdict.verdict === "go_live" && product.status !== "draft") throw new Error("Only a draft product may use go_live");
  if (!verdict.title || verdict.title.length > 70) throw new Error("Publishable product title is missing or over 70 characters");
  if (!verdict.seo_title || verdict.seo_title.length > 65) throw new Error("SEO title is missing or over 65 characters");
  if (!verdict.seo_description || verdict.seo_description.length > 160) throw new Error("SEO description is missing or over 160 characters");
  if (!product.body_html?.trim()) throw new Error("Product has no truthful source description");
  if (!product.images?.length) throw new Error("Product has no images");
  if (!product.variants?.length) throw new Error("Product has no purchasable variant");
  if (requireSeoEvidence) {
    const evidence = product.seo_evidence;
    if (!evidence?.complete || Date.parse(evidence.expiresAt) <= now.getTime()
      || !["product", "category"].includes(evidence.evidenceScope ?? "product")
      || (catalogHash && evidence.catalogHash !== catalogHash)) {
      throw new Error("Product lacks complete, fresh product or category SEO/Shopping evidence");
    }
  }
  if (verdict.new_price != null && (!Number.isFinite(verdict.new_price) || verdict.new_price <= 0)) throw new Error("Invalid proposed price");
  if (verdict.verdict === "reprice" && verdict.new_price == null) throw new Error("Reprice verdict requires new_price");
  if (verdict.image_alts?.length && verdict.image_alts.length !== product.images.length) throw new Error("Image-alt count must match the live image count");

  return {
    title: verdict.title,
    body_html: verdict.body_html || product.body_html,
    seo_title: verdict.seo_title,
    seo_description: verdict.seo_description,
    ...(verdict.image_alts?.length ? { image_alts: verdict.image_alts } : {}),
    ...(verdict.new_price != null ? { variant_prices: { [product.variants[0].id]: Number(verdict.new_price).toFixed(2) } } : {}),
    ...(verdict.verdict === "go_live" ? { status: "active" } : {}),
  };
}
