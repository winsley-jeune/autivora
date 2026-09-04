// Market intelligence layer over the AliExpress DS API — every hard-won fix from the manual
// sourcing sessions lives here exactly once:
//   - NGSELECTION_SEARCH_ERROR is transient → retry, never record as "zero results"
//   - freight.query is the ONLY truth for stock/delivery (search results and listing stock lie)
//   - pick the best-stocked SKU variant, never the first match
//   - live freight response returns delivery_options as a flat array (docs show it nested)
import { callAliExpressApi } from "./aliexpress-client.mjs";
import { TIERS, isNoise } from "./policy.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEARCH_RETRIES = 2;

// Returns { ok, totalCount, products } — products carry the market signals Scout reasons over
// (orders, rating/score, price). ok:false means the search backend erred even after retries.
export async function searchKeyword({ keyword, tier, auth, pageIndex = 1 }) {
  const params = {
    keyWord: keyword,
    local: "en_US",
    countryCode: "US",
    currency: "USD",
    pageSize: 20,
    pageIndex,
    sortBy: "orders,desc",
  };
  const shipFrom = TIERS[tier].searchShipFromFilter;
  if (shipFrom) params.searchExtend = JSON.stringify([{ searchKey: "ship_from", searchValue: shipFrom }]);

  for (let attempt = 0; attempt <= SEARCH_RETRIES; attempt++) {
    const res = await callAliExpressApi({ method: "aliexpress.ds.text.search", params, ...auth });
    if (res.code === "00") {
      const products = (res.data?.products ?? []).map((p) => ({
        itemId: p.itemId,
        title: p.title,
        price: parseFloat((p.targetSalePrice || "0").replace(/[^0-9.]/g, "")),
        orders: parseInt(String(p.orders ?? "0").replace(/[^0-9]/g, "")) || 0,
        ordersRaw: p.orders ?? "0", // "10,000+" carries more info than the parsed 10000
        rating: parseFloat(p.score) || 0,
        image: p.itemMainPic,
      }));
      return { ok: true, totalCount: res.data?.totalCount ?? 0, products };
    }
    if (attempt < SEARCH_RETRIES) await sleep(1500);
  }
  return { ok: false, totalCount: 0, products: [] };
}

export async function getProductDetail({ itemId, auth }) {
  const res = await callAliExpressApi({
    method: "aliexpress.ds.product.get",
    params: { ship_to_country: "US", product_id: itemId, target_currency: "USD", target_language: "en" },
    ...auth,
  });
  return res.result;
}

export function pickSku(skus, tier) {
  const byStock = (a, b) => (b.sku_available_stock ?? 0) - (a.sku_available_stock ?? 0);
  const stocked = (skus ?? []).filter((s) => s.sku_available_stock > 0).sort(byStock);
  if (TIERS[tier].shipFromUSVariantPreferred) {
    const usStocked = stocked.filter((s) =>
      s.ae_sku_property_dtos?.some((p) => p.sku_property_name === "Ships From" && /united states/i.test(p.sku_property_value)),
    );
    if (usStocked.length) return usStocked[0];
  }
  return stocked[0] ?? (skus ?? [])[0] ?? null;
}

export async function queryFreight({ itemId, skuId, auth }) {
  const res = await callAliExpressApi({
    method: "aliexpress.ds.freight.query",
    params: {
      queryDeliveryReq: JSON.stringify({
        quantity: "1",
        shipToCountry: "US",
        productId: itemId,
        provinceCode: "California",
        cityCode: "Los Angeles",
        selectedSkuId: skuId,
        language: "en_US",
        locale: "en_US",
        currency: "USD",
      }),
    },
    ...auth,
  });
  const raw = res.result?.delivery_options;
  const options = Array.isArray(raw) ? raw : (raw?.delivery_option_d_t_o ?? []);
  const fastest = options.sort((a, b) => (a.max_delivery_days ?? 999) - (b.max_delivery_days ?? 999))[0] ?? null;
  return { success: res.result?.success ?? false, msg: res.result?.msg, fastest };
}

// Full verification of one candidate: detail → best SKU → live freight. The gate every product
// must pass before Scout is even allowed to consider it. Returns a verification record whether
// it passed or not, so failures land in the rejected/cooldown list with a concrete reason.
export async function verifyCandidate({ itemId, tier, auth }) {
  const detail = await getProductDetail({ itemId, auth });
  const base = detail?.ae_item_base_info_dto;
  if (!base) return { itemId, ok: false, reason: "no product detail returned" };
  if (isNoise(base.subject)) return { itemId, ok: false, reason: "noise (title-level category collision)" };

  const sku = pickSku(detail.ae_item_sku_info_dtos, tier);
  if (!sku || !(sku.sku_available_stock > 0)) return { itemId, ok: false, reason: "no SKU with live stock" };

  await sleep(700);
  const freight = await queryFreight({ itemId, skuId: sku.sku_id, auth });
  if (!freight.success || !freight.fastest) return { itemId, ok: false, reason: `freight: ${freight.msg ?? "no options"}` };

  const t = TIERS[tier];
  const shippingFee = parseFloat(String(freight.fastest.shipping_fee_cent ?? "0")) || 0;
  const productCost = parseFloat(sku.offer_sale_price);
  const landedCost = productCost + shippingFee;
  const maxDays = freight.fastest.max_delivery_days ?? 999;

  if (maxDays > t.maxDeliveryDays) return { itemId, ok: false, reason: `delivery ${maxDays}d exceeds tier max ${t.maxDeliveryDays}d` };
  if (landedCost > t.maxLandedCost) return { itemId, ok: false, reason: `landed $${landedCost.toFixed(2)} exceeds tier max $${t.maxLandedCost}` };

  return {
    itemId,
    ok: true,
    tier,
    title: base.subject,
    skuId: sku.sku_id,
    stock: sku.sku_available_stock,
    productCost,
    shippingFee,
    landedCost,
    deliveryMin: freight.fastest.min_delivery_days,
    deliveryMax: maxDays,
    shipFrom: freight.fastest.ship_from_country,
    freeShipping: freight.fastest.free_shipping === true,
    rating: parseFloat(base.avg_evaluation_rating) || 0,
    reviews: parseInt(base.evaluation_count) || 0,
    sales: base.sales_count ?? "0",
    categoryId: base.category_id,
    images: (detail.ae_multimedia_info_dto?.image_urls ?? "").split(";").filter(Boolean),
    storeName: detail.ae_store_info?.store_name,
    storeCountry: detail.ae_store_info?.store_country_code,
  };
}
