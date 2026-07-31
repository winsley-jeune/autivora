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
import { readEnv, readOptionalEnv } from "./lib/env.mjs";
import { getShopifyAdminToken } from "./lib/shopify-auth.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const DAYS = Number(process.argv[2]) || 28;
const API = "2024-10";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function dateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function listOrders(domain, token, sinceISO) {
  const all = [];
  let url = `orders.json?status=any&created_at_min=${encodeURIComponent(sinceISO)}` +
    `&limit=250&fields=id,created_at,total_price,currency,financial_status,cancelled_at,test,email,line_items`;
  while (url) {
    const res = await fetch(`https://${domain}/admin/api/${API}/${url}`, {
      headers: { "X-Shopify-Access-Token": token },
    });
    if (!res.ok) throw new Error(`orders list → ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const json = await res.json();
    all.push(...(json.orders || []));
    const link = res.headers.get("link") || "";
    const next = link.match(/<[^>]*[?&]page_info=([^>&]+)[^>]*>;\s*rel="next"/);
    url = next ? `orders.json?limit=250&page_info=${next[1]}` : null;
    await sleep(550); // throttle: stay under 2 req/sec (Basic plan)
  }
  return all;
}

function aggregate(orders, testCustomerEmails) {
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
    excludedTestOrders: orders.filter((o) => o.test).length,
    excludedCancelledOrders: orders.filter((o) => o.cancelled_at).length,
    excludedKnownTestCustomerOrders: orders.filter(isKnownTestCustomer).length,
  };
}

export async function pullShopify() {
  const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID, SHOPIFY_ADMIN_CLIENT_SECRET } =
    readEnv(["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_CLIENT_ID", "SHOPIFY_ADMIN_CLIENT_SECRET"]);
  // Own/friend/family checkout-flow tests don't set Shopify's `test` flag (that's only real
  // test-mode orders) — this is the manual escape hatch for "I bought it myself to check
  // checkout" so those don't get read by Signal as market/demand signal.
  const { SIGNAL_TEST_CUSTOMER_EMAILS } = readOptionalEnv(["SIGNAL_TEST_CUSTOMER_EMAILS"]);
  const testCustomerEmails = new Set(
    (SIGNAL_TEST_CUSTOMER_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
  );
  const token = await getShopifyAdminToken(SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID, SHOPIFY_ADMIN_CLIENT_SECRET);
  const orders = await listOrders(SHOPIFY_STORE_DOMAIN, token, dateNDaysAgo(DAYS));
  return { storeDomain: SHOPIFY_STORE_DOMAIN, windowDays: DAYS, ...aggregate(orders, testCustomerEmails) };
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
