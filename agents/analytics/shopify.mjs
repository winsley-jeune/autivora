#!/usr/bin/env node
// Pulls Shopify order/revenue data (count, revenue, AOV, top products, revenue-by-day) for the
// last N days. Read-only — safe to run on a schedule, no publishing/spend side effects.
// Counts non-test, non-cancelled orders regardless of financial_status (fine for a store where
// checkout captures payment immediately; revisit if COD/manual payment methods are ever added).
//
// Usage:
//   node agents/analytics/shopify.mjs [days]   # default 28
//
// Requires .env: SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID, SHOPIFY_ADMIN_CLIENT_SECRET
// (Dev Dashboard app, read_orders scope, OAuth client credentials grant)
// Setup: see agents/analytics/README.md
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readOptionalEnv } from "../lib/env.mjs";
import { initShopify, shopifyApi } from "../lib/shopify.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const DAYS = Number(process.argv[2]) || 28;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function dateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export async function listOrders(sinceISO, { pageLimit = 10_000 } = {}) {
  const all = [];
  let url = `orders.json?status=any&created_at_min=${encodeURIComponent(sinceISO)}` +
    `&limit=250&fields=id,created_at,total_price,currency,financial_status,cancelled_at,test,email,line_items,landing_site,referring_site,source_name`;
  let pages = 0;
  while (url && pages < pageLimit) {
    const json = await shopifyApi("GET", url);
    all.push(...(json.orders || []));
    url = json._linkNext ? `orders.json?limit=250&page_info=${json._linkNext}` : null;
    pages += 1;
    await sleep(550); // throttle: stay under 2 req/sec (Basic plan)
  }
  return { orders: all, complete: !url, pages, reason: url ? `safety ceiling reached (${pageLimit} pages)` : null };
}

export function attributionChannel(order) {
  const landing = order.landing_site || "";
  const referrer = order.referring_site || "";
  let source = "";
  try { source = new URL(landing, "https://autivara.com").searchParams.get("utm_source") || ""; } catch {}
  const signal = `${source} ${referrer}`.toLowerCase();
  if (/google|bing|yahoo|duckduckgo|ecosia|baidu|yandex/.test(signal)) return "organic_search";
  if (/chatgpt|openai|perplexity|claude|gemini|copilot/.test(signal)) return "ai_assistant";
  if (source) return source;
  if (referrer) return "referral";
  return "unknown";
}

export function aggregate(orders, testCustomerEmails) {
  const isKnownTestCustomer = (o) => o.email && testCustomerEmails.has(o.email.toLowerCase());
  const valid = orders.filter((o) => !o.test && !o.cancelled_at && !isKnownTestCustomer(o));
  const revenue = valid.reduce((s, o) => s + Number(o.total_price), 0);
  const orderCount = valid.length;
  const aov = orderCount ? revenue / orderCount : 0;
  const currency = valid[0]?.currency || "USD";

  const byDayMap = new Map();
  for (const o of valid) {
    const day = o.created_at.slice(0, 10);
    const cur = byDayMap.get(day) || { date: day, orders: 0, revenue: 0 };
    cur.orders += 1;
    cur.revenue += Number(o.total_price);
    byDayMap.set(day, cur);
  }

  const productMap = new Map();
  for (const o of valid) {
    for (const li of o.line_items || []) {
      const cur = productMap.get(li.title) || { title: li.title, quantity: 0, revenue: 0 };
      cur.quantity += li.quantity;
      cur.revenue += Number(li.price) * li.quantity;
      productMap.set(li.title, cur);
    }
  }

  const attributedOrders = valid.map((order) => ({
    id: order.id,
    createdAt: order.created_at,
    revenue: Number(order.total_price),
    channel: attributionChannel(order),
    landingSite: order.landing_site || null,
    referringSite: order.referring_site || null,
    sourceName: order.source_name || null,
  }));
  const organicOrders = attributedOrders.filter((order) => order.channel === "organic_search");
  const knownAttributionOrders = attributedOrders.filter((order) => order.channel !== "unknown");

  return {
    orderCount,
    revenue: Number(revenue.toFixed(2)),
    aov: Number(aov.toFixed(2)),
    currency,
    byDay: [...byDayMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
    topProducts: [...productMap.values()]
      .map((p) => ({ ...p, revenue: Number(p.revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 15),
    attributedOrders,
    organicOrderCount: organicOrders.length,
    organicRevenue: Number(organicOrders.reduce((sum, order) => sum + order.revenue, 0).toFixed(2)),
    attributionCoverage: orderCount ? Number((knownAttributionOrders.length / orderCount).toFixed(4)) : 1,
    excludedTestOrders: orders.filter((o) => o.test).length,
    excludedCancelledOrders: orders.filter((o) => o.cancelled_at).length,
    excludedKnownTestCustomerOrders: orders.filter(isKnownTestCustomer).length,
  };
}

export async function pullShopify() {
  // Own/friend/family checkout-flow tests don't set Shopify's `test` flag (that's only real
  // test-mode orders) — this is the manual escape hatch for "I bought it myself to check
  // checkout" so those don't get read by Signal as market/demand signal.
  const { SIGNAL_TEST_CUSTOMER_EMAILS, SHOPIFY_STORE_DOMAIN } = readOptionalEnv(["SIGNAL_TEST_CUSTOMER_EMAILS", "SHOPIFY_STORE_DOMAIN"]);
  const testCustomerEmails = new Set(
    (SIGNAL_TEST_CUSTOMER_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
  );
  await initShopify();
  const result = await listOrders(dateNDaysAgo(DAYS));
  return {
    storeDomain: SHOPIFY_STORE_DOMAIN,
    windowDays: DAYS,
    ...aggregate(result.orders, testCustomerEmails),
    completeness: { complete: result.complete, rowCount: result.orders.length, pages: result.pages, reason: result.reason },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const report = await pullShopify();
    console.log(
      `Shopify: ${report.orderCount} orders, $${report.revenue} revenue (AOV $${report.aov}) over last ${DAYS}d ` +
      `(excluded ${report.excludedTestOrders} test, ${report.excludedCancelledOrders} cancelled, ` +
      `${report.excludedKnownTestCustomerOrders} known-test-customer).`
    );

    console.log("\nTop products by revenue:");
    report.topProducts.slice(0, 5).forEach((p) => console.log(`  $${p.revenue.toFixed(2).padStart(8)} | qty ${p.quantity} | ${p.title}`));

    mkdirSync(join(__dir, "output"), { recursive: true });
    const outPath = join(__dir, "output", "shopify-latest.json");
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`\nSaved → ${outPath}`);
  })().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
}
