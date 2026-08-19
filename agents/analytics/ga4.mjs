#!/usr/bin/env node
// Pulls GA4 sessions/conversions by channel and by landing page for the last N days.
// Read-only — safe to run on a schedule, no publishing/spend side effects.
//
// Usage:
//   node agents/analytics/ga4.mjs [days]   # default 28
//
// Requires .env: GOOGLE_SERVICE_ACCOUNT_KEY_PATH, GA4_PROPERTY_ID
// Setup: see agents/analytics/README.md
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readEnv } from "../lib/env.mjs";
import { getAccessToken } from "./lib/google-auth.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const DAYS = Number(process.argv[2]) || 28;
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

async function runReport(propertyId, token, body) {
  const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`GA4 report failed: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

export async function runCompleteReport(propertyId, token, body, { pageSize = 10_000, maxRows = 100_000 } = {}) {
  const rows = [];
  let headers = null;
  let expectedRows = null;
  while (rows.length < maxRows) {
    const report = await runReport(propertyId, token, { ...body, offset: rows.length, limit: Math.min(pageSize, maxRows - rows.length) });
    headers ??= report;
    expectedRows = Number(report.rowCount ?? 0);
    const page = report.rows ?? [];
    rows.push(...page);
    if (!page.length || rows.length >= expectedRows) {
      return { report: { ...headers, rows, rowCount: expectedRows }, complete: rows.length >= expectedRows, rowCount: rows.length };
    }
  }
  return { report: { ...headers, rows, rowCount: expectedRows }, complete: false, rowCount: rows.length, reason: `safety ceiling reached (${maxRows} rows)` };
}

function rowsToObjects(report) {
  const dimNames = (report.dimensionHeaders || []).map((h) => h.name);
  const metricNames = (report.metricHeaders || []).map((h) => h.name);
  return (report.rows || []).map((row) => {
    const obj = {};
    row.dimensionValues.forEach((v, i) => (obj[dimNames[i]] = v.value));
    row.metricValues.forEach((v, i) => (obj[metricNames[i]] = Number(v.value)));
    return obj;
  });
}

export async function pullGA4() {
  const { GOOGLE_SERVICE_ACCOUNT_KEY_PATH, GA4_PROPERTY_ID } = readEnv(["GOOGLE_SERVICE_ACCOUNT_KEY_PATH", "GA4_PROPERTY_ID"]);
  const token = await getAccessToken(GOOGLE_SERVICE_ACCOUNT_KEY_PATH, SCOPE);
  const dateRanges = [{ startDate: `${DAYS}daysAgo`, endDate: "yesterday" }];

  const [channelResult, landingResult, purchaseResult] = await Promise.all([
    runCompleteReport(GA4_PROPERTY_ID, token, {
      dateRanges,
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }, { name: "conversions" }, { name: "totalRevenue" }],
    }),
    runCompleteReport(GA4_PROPERTY_ID, token, {
      dateRanges,
      dimensions: [{ name: "landingPage" }],
      metrics: [{ name: "sessions" }, { name: "conversions" }],
    }),
    // Revenue attribution (CEO change #5): which landing page actually produced purchases —
    // the join Signal has been flagging as missing every run. Zero rows is a valid result on
    // a young store; the point is the lane exists so checkbacks can score revenue impact.
    runCompleteReport(GA4_PROPERTY_ID, token, {
      dateRanges,
      dimensions: [{ name: "landingPage" }],
      metrics: [{ name: "transactions" }, { name: "purchaseRevenue" }, { name: "sessions" }],
    }),
  ]);

  return {
    propertyId: GA4_PROPERTY_ID,
    windowDays: DAYS,
    byChannel: rowsToObjects(channelResult.report),
    byLandingPage: rowsToObjects(landingResult.report),
    purchasesByLandingPage: rowsToObjects(purchaseResult.report).filter((r) => r.transactions > 0),
    completeness: {
      complete: channelResult.complete && landingResult.complete && purchaseResult.complete,
      byChannel: { complete: channelResult.complete, rowCount: channelResult.rowCount, reason: channelResult.reason ?? null },
      byLandingPage: { complete: landingResult.complete, rowCount: landingResult.rowCount, reason: landingResult.reason ?? null },
      purchasesByLandingPage: { complete: purchaseResult.complete, rowCount: purchaseResult.rowCount, reason: purchaseResult.reason ?? null },
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const report = await pullGA4();
    console.log(`GA4: ${report.byChannel.length} channels, ${report.byLandingPage.length} landing pages over last ${DAYS}d.`);
    report.byChannel.forEach((r) =>
      console.log(`  ${r.sessionDefaultChannelGroup.padEnd(20)} sessions=${r.sessions} conversions=${r.conversions} revenue=$${r.totalRevenue}`)
    );

    mkdirSync(join(__dir, "output"), { recursive: true });
    const outPath = join(__dir, "output", "ga4-latest.json");
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`\nSaved → ${outPath}`);
  })().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
}
