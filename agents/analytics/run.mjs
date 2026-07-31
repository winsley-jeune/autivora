#!/usr/bin/env node
// Growth loop MEASURE tier entry point: pulls Search Console + GA4 + Shopify orders and writes
// one combined snapshot. Read-only — this is what the scheduled routine calls unattended.
//
// Usage:
//   node agents/analytics/run.mjs [days]   # default 28
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pullSearchConsole } from "./search-console.mjs";
import { pullGA4 } from "./ga4.mjs";
import { pullShopify } from "./shopify.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));

(async () => {
  const [searchConsole, ga4, shopify] = await Promise.all([pullSearchConsole(), pullGA4(), pullShopify()]);
  const snapshot = { generatedAt: new Date().toISOString(), searchConsole, ga4, shopify };

  mkdirSync(join(__dir, "output"), { recursive: true });
  const outPath = join(__dir, "output", "snapshot-latest.json");
  writeFileSync(outPath, JSON.stringify(snapshot, null, 2));

  // Dated, never-overwritten-across-days archive. snapshot-latest.json alone can't support
  // Signal's checkback scoring — by the time a 14/28-day check-back date arrives, "latest" has
  // long since moved on and there's no before/after trail for the specific page+query a task
  // targeted. One file per calendar day (re-running the same day updates that day's file, which
  // is fine — it's still that day's true state).
  const historyDir = join(__dir, "output", "history");
  mkdirSync(historyDir, { recursive: true });
  const dateStr = snapshot.generatedAt.slice(0, 10);
  writeFileSync(join(historyDir, `snapshot-${dateStr}.json`), JSON.stringify(snapshot, null, 2));

  console.log(`Measure snapshot saved → ${outPath}`);
  console.log(`  History archived → ${join(historyDir, `snapshot-${dateStr}.json`)}`);
  console.log(`  Search Console: ${searchConsole.queries.length} queries, ${searchConsole.pages.length} pages`);
  console.log(`  GA4: ${ga4.byChannel.length} channels, ${ga4.byLandingPage.length} landing pages`);
  console.log(`  Shopify: ${shopify.orderCount} orders, $${shopify.revenue} revenue (AOV $${shopify.aov}) over ${shopify.windowDays}d`);
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
