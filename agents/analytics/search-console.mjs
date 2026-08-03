#!/usr/bin/env node
// Pulls Search Console query + page performance for the last N days.
// Read-only — safe to run on a schedule, no publishing/spend side effects.
//
// Usage:
//   node agents/analytics/search-console.mjs [days]   # default 28
//
// Requires .env: GOOGLE_SERVICE_ACCOUNT_KEY_PATH, GSC_SITE_URL
// Setup: see agents/analytics/README.md
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readEnv } from "./lib/env.mjs";
import { getAccessToken } from "./lib/google-auth.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const DAYS = Number(process.argv[2]) || 28;
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

function dateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function fetchSearchAnalytics(siteUrl, token, dimensions, rowLimit = 1000) {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  // dataState "all" includes fresh (not-yet-finalized) rows — without it the API silently
  // returns nothing for the last ~2-3 days, so the window always missed the newest activity.
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ startDate: dateNDaysAgo(DAYS), endDate: dateNDaysAgo(0), dimensions, rowLimit, dataState: "all" }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Search Console query failed: ${res.status} ${JSON.stringify(json)}`);
  return json.rows || [];
}

export async function pullSearchConsole() {
  const { GOOGLE_SERVICE_ACCOUNT_KEY_PATH, GSC_SITE_URL } = readEnv(["GOOGLE_SERVICE_ACCOUNT_KEY_PATH", "GSC_SITE_URL"]);
  const token = await getAccessToken(GOOGLE_SERVICE_ACCOUNT_KEY_PATH, SCOPE);
  // pageQueries (page+query dimension) is the finer-grained breakdown the Signal agent needs
  // to attribute a CTR/position opportunity to a specific page — queries/pages alone can't.
  const [queries, pages, pageQueries, byDate] = await Promise.all([
    fetchSearchAnalytics(GSC_SITE_URL, token, ["query"]),
    fetchSearchAnalytics(GSC_SITE_URL, token, ["page"]),
    fetchSearchAnalytics(GSC_SITE_URL, token, ["page", "query"], 2000),
    fetchSearchAnalytics(GSC_SITE_URL, token, ["date"], 40),
  ]);
  // The freshest date Google actually returned data for — consumers (Signal) should treat
  // this, not "yesterday", as the data horizon. Fresh rows past the finalized window are
  // partial and may still revise upward.
  const dataThrough = byDate.map((r) => r.keys[0]).sort().at(-1) ?? null;
  return { siteUrl: GSC_SITE_URL, windowDays: DAYS, dataThrough, queries, pages, pageQueries };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const report = await pullSearchConsole();
    console.log(`Search Console: ${report.queries.length} queries, ${report.pages.length} pages, ${report.pageQueries.length} page+query rows over last ${DAYS}d.`);

    const topQueries = [...report.queries].sort((a, b) => b.impressions - a.impressions).slice(0, 10);
    console.log("\nTop queries by impressions:");
    topQueries.forEach((r) => console.log(`  ${String(r.impressions).padStart(6)} impr | ${r.clicks} clicks | ${r.keys[0]}`));

    mkdirSync(join(__dir, "output"), { recursive: true });
    const outPath = join(__dir, "output", "search-console-latest.json");
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`\nSaved → ${outPath}`);
  })().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
}
