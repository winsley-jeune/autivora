#!/usr/bin/env node
// Checks real indexing status for every URL in the live sitemap via the Search Console URL
// Inspection API — a different signal than search-console.mjs, which only reports pages that
// already have ≥1 impression. This tells you which pages Google hasn't indexed at all, and why.
// Read-only — safe to run anytime, but slow-ish (one API call per URL) so it's a standalone
// audit script, not part of run.mjs's daily/weekly snapshot.
//
// Usage:
//   node agents/analytics/index-coverage.mjs
//
// Requires .env: GOOGLE_SERVICE_ACCOUNT_KEY_PATH, GSC_SITE_URL
// Also reads NEXT_PUBLIC_BASE_URL (falls back to https://autivara.com) to fetch the sitemap.
// Setup: see agents/analytics/README.md
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readEnv } from "./lib/env.mjs";
import { getAccessToken } from "./lib/google-auth.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchSitemapUrls(baseUrl) {
  const res = await fetch(`${baseUrl}/sitemap.xml`);
  if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function inspectUrl(siteUrl, token, inspectionUrl) {
  const res = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inspectionUrl, siteUrl }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`inspect ${inspectionUrl} → ${res.status}: ${JSON.stringify(json)}`);
  return json.inspectionResult?.indexStatusResult ?? {};
}

export async function pullIndexCoverage() {
  const { GOOGLE_SERVICE_ACCOUNT_KEY_PATH, GSC_SITE_URL } = readEnv(["GOOGLE_SERVICE_ACCOUNT_KEY_PATH", "GSC_SITE_URL"]);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://autivara.com";
  const token = await getAccessToken(GOOGLE_SERVICE_ACCOUNT_KEY_PATH, SCOPE);
  const urls = await fetchSitemapUrls(baseUrl);

  const results = [];
  for (const url of urls) {
    try {
      const r = await inspectUrl(GSC_SITE_URL, token, url);
      results.push({
        url,
        indexed: r.coverageState === "Submitted and indexed",
        coverageState: r.coverageState ?? "UNKNOWN",
        verdict: r.verdict ?? "UNKNOWN",
        robotsTxtState: r.robotsTxtState,
        lastCrawlTime: r.lastCrawlTime ?? null,
      });
    } catch (e) {
      results.push({ url, indexed: false, coverageState: "INSPECTION_FAILED", error: e.message });
    }
    await sleep(300); // stay well under URL Inspection API's per-minute quota
  }

  const indexed = results.filter((r) => r.indexed);
  const notIndexed = results.filter((r) => !r.indexed);
  const byReason = {};
  for (const r of notIndexed) byReason[r.coverageState] = (byReason[r.coverageState] ?? 0) + 1;

  return { siteUrl: GSC_SITE_URL, generatedAt: new Date().toISOString(), totalUrls: urls.length, indexedCount: indexed.length, notIndexedCount: notIndexed.length, byReason, notIndexed, results };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const report = await pullIndexCoverage();
    console.log(`Index coverage: ${report.indexedCount}/${report.totalUrls} indexed, ${report.notIndexedCount} not indexed.\n`);
    console.log("Not-indexed breakdown by reason:");
    Object.entries(report.byReason).sort((a, b) => b[1] - a[1]).forEach(([reason, count]) => console.log(`  ${String(count).padStart(3)}  ${reason}`));
    console.log("\nNot-indexed URLs:");
    report.notIndexed.forEach((r) => console.log(`  [${r.coverageState}] ${r.url}`));

    mkdirSync(join(__dir, "output"), { recursive: true });
    const outPath = join(__dir, "output", "index-coverage-latest.json");
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`\nSaved → ${outPath}`);
  })().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
}
