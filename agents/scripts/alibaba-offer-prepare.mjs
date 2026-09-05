#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initShopify, shopifyApi, createAlibabaDraftProduct } from "../dropship/lib/shopify.mjs";
import { mutateCatalog } from "../dropship/lib/catalog-store.mjs";
import { calculateUnitEconomics, upsertUnitEconomics } from "../lib/profit-control.mjs";

export function validateAlibabaLaunchDossier(dossier) {
  const required = [dossier.alibabaId, dossier.sku, dossier?.supplier?.name, dossier?.supplier?.url,
    dossier?.collection?.handle, dossier?.offer?.title, dossier?.offer?.bodyHtml,
    dossier?.offer?.seoTitle, dossier?.offer?.seoDescription];
  if (required.some((value) => !String(value ?? "").trim())) throw new Error("Launch dossier is incomplete");
  if (!Array.isArray(dossier.supplier.images) || !dossier.supplier.images.length) throw new Error("A real supplier image is required");
  const deliveryMinDays = Number(dossier.supplier.evidence?.deliveryMinDays);
  const deliveryMaxDays = Number(dossier.supplier.evidence?.deliveryMaxDays);
  const testQuantity = Number(dossier.supplier.evidence?.testQuantity);
  const deliveryKnown = Number.isFinite(deliveryMinDays) && deliveryMinDays > 0
    && Number.isFinite(deliveryMaxDays) && deliveryMaxDays > 0;
  const deliveryUnconfirmed = dossier.supplier.evidence?.deliveryStatus === "unconfirmed";
  if (!dossier.supplier.evidence?.verifiedAt
    || !Number.isFinite(testQuantity) || testQuantity <= 0
    || (!deliveryKnown && !deliveryUnconfirmed)
    || (deliveryKnown && deliveryMaxDays > 30)) {
    throw new Error("Fresh supplier, test-quantity, and valid delivery evidence or an unconfirmed-delivery disclosure is required");
  }
  if (deliveryUnconfirmed) {
    const deliveryPromise = /\b(deliver(?:y|ed)?|ships?|arrives?)\b.{0,40}\b\d+\s*(?:business\s*)?(?:days?|weeks?)\b/i;
    if (deliveryPromise.test(dossier.offer.bodyHtml)) {
      throw new Error("An offer with unconfirmed delivery must not promise a delivery timeframe");
    }
  }
  const market = dossier.marketEvidence;
  if (!market?.verifiedAt || market.intent !== "transactional"
    || !Number.isFinite(Number(market.monthlySearchVolume)) || Number(market.monthlySearchVolume) <= 0
    || !Number.isFinite(Number(market.shoppingComparables)) || Number(market.shoppingComparables) < 5) {
    throw new Error("Fresh transactional demand and US marketplace evidence is required");
  }
  if (dossier.offer.seoTitle.length > 60 || dossier.offer.seoDescription.length > 160) throw new Error("SEO metadata exceeds its limit");
  const economics = calculateUnitEconomics({ productKey: dossier.sku, ...dossier.economics });
  if (!economics.complete || !economics.passesMarginGate) throw new Error("Offer does not pass the 30% contribution-margin gate");
  return economics;
}

export async function prepareAlibabaOffer(dossier, { dryRun = false } = {}) {
  const economics = validateAlibabaLaunchDossier(dossier);
  if (dryRun) return { dossier, economics };
  await initShopify();
  const generatedImages = (dossier.assets?.shopify ?? []).map((asset) => ({
    attachment: readFileSync(resolve(asset.path)).toString("base64"), filename: asset.filename, alt: asset.alt,
  }));
  const product = await createAlibabaDraftProduct({ dossier, generatedImages });
  const collections = await shopifyApi("GET", "custom_collections.json?limit=250");
  let collection = (collections.custom_collections ?? []).find((item) => item.handle === dossier.collection.handle);
  if (!collection) {
    const hero = dossier.assets?.categoryHero ? readFileSync(resolve(dossier.assets.categoryHero)).toString("base64") : null;
    collection = (await shopifyApi("POST", "custom_collections.json", { custom_collection: {
      title: dossier.collection.title, handle: dossier.collection.handle, published: false,
      body_html: `<p>Explore waterless scent systems and connected air-care devices selected to make room atmosphere easier to control.</p>`,
      ...(hero ? { image: { attachment: hero, filename: "smart-home-atmosphere-hero.png", alt: "Smart Home Atmosphere collection" } } : {}),
    } })).custom_collection;
  }
  try { await shopifyApi("POST", "collects.json", { collect: { product_id: Number(product.id), collection_id: collection.id } }); }
  catch (error) { if (!/already|exists|422/i.test(error.message)) throw error; }
  upsertUnitEconomics({ productKey: String(product.id), ...dossier.economics, source: "authenticated-alibaba-live-page",
    verifiedAt: dossier.supplier.evidence.verifiedAt, detail: { alibabaId: dossier.alibabaId, supplier: dossier.supplier.name } });
  await mutateCatalog((store) => {
    const record = { itemId: `alibaba-${dossier.alibabaId}`, skuId: dossier.sku, type: "alibaba-private-label",
      tier: "core", collection: dossier.collection.handle, title: dossier.offer.title, shopifyId: product.id,
      status: "draft", landedCost: dossier.economics.landedCost, price: dossier.economics.sellingPrice,
      priceMultiple: Number((dossier.economics.sellingPrice / dossier.economics.landedCost).toFixed(2)), stock: dossier.supplier.evidence.testQuantity,
      deliveryMin: dossier.supplier.evidence.deliveryMinDays, deliveryMax: dossier.supplier.evidence.deliveryMaxDays,
      shipFrom: "CN", rating: dossier.supplier.evidence.rating, reviews: dossier.supplier.evidence.storeReviews,
      orders: dossier.supplier.evidence.sold, channelEligibility: ["autivara"], competition: { saturated: false, validationPending: true },
      marketingAngle: dossier.offer.positioning, importedOn: new Date().toISOString().slice(0,10),
      lastVerifiedOn: dossier.supplier.evidence.verifiedAt.slice(0,10), hypothesisId: dossier.hypothesisId };
    const index = store.products.findIndex((item) => String(item.itemId) === record.itemId);
    if (index >= 0) store.products[index] = { ...store.products[index], ...record }; else store.products.push(record);
  });
  return { product, collection, economics };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv.find((arg, index) => index > 1 && !arg.startsWith("--"));
  if (!path) throw new Error("Usage: node agents/scripts/alibaba-offer-prepare.mjs <dossier.json> [--dry-run]");
  const result = await prepareAlibabaOffer(JSON.parse(readFileSync(resolve(path), "utf8")), { dryRun: process.argv.includes("--dry-run") });
  console.log(JSON.stringify(result, null, 2));
}
