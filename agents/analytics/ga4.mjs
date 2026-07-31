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
import { readEnv } from "./lib/env.mjs";
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
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`GA4 report failed: ${res.status} ${JSON.stringify(json)}`);
  return json;
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

  const [byChannelReport, byLandingPageReport] = await Promise.all([
    runReport(GA4_PROPERTY_ID, token, {
      dateRanges,
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }, { name: "conversions" }, { name: "totalRevenue" }],
    }),
    runReport(GA4_PROPERTY_ID, token, {
      dateRanges,
      dimensions: [{ name: "landingPage" }],
      metrics: [{ name: "sessions" }, { name: "conversions" }],
      limit: 50,
    }),
  ]);

  return {
    propertyId: GA4_PROPERTY_ID,
    windowDays: DAYS,
    byChannel: rowsToObjects(byChannelReport),
    byLandingPage: rowsToObjects(byLandingPageReport),
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
