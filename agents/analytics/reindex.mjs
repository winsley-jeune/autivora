#!/usr/bin/env node
// Recrawl routine — resubmits the sitemap when commercial URLs are new or remain unindexed.
// Runs in the daily loop right after analytics and is change/cooldown driven.
//
// What counts as "changed" (the triggers, checked in order):
//   1. NEW URLs in the live sitemap since the last run (e.g. the autivara-* slug renames, a
//      published collection) — first-seen URLs are exactly what Google doesn't know exists.
//   2. Known-unindexed product/collection pages from the freshest index-coverage audit that
//      haven't been (re)submitted within the cooldown.
//
// Uses Search Console sitemaps.submit so changed URLs re-enter Google's crawl queue through the
// supported ecommerce path. The Indexing API is deliberately not used: Google restricts it to
// JobPosting and livestream BroadcastEvent pages, not product/category URLs.
//
// State lives in agents.db (reindex_log + kv sitemap snapshot) per the no-JSON-stores rule.
// Caps: MAX_PER_RUN 30 candidate records, COOLDOWN_DAYS 7 per URL.
//
// Requires .env: GOOGLE_SERVICE_ACCOUNT_KEY_PATH, GSC_SITE_URL
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readEnv } from "../lib/env.mjs";
import { getAccessToken } from "./lib/google-auth.mjs";
import { openDb, kvGet, kvSet } from "../lib/db.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://autivara.com";
const MAX_PER_RUN = 30;
const COOLDOWN_DAYS = 7;
const SEEN_KEY = "reindex.sitemap_urls";

// Money pages first: product and collection surfaces are where sales happen (operator
// page-type policy) — blogs ride the sitemap resubmit instead of spending API quota.
const MONEY_PATH = /^\/(product\/|home$|home\/|industrial|scents|collection$|auto$)/;

function ensureStore() {
  const d = openDb();
  d.exec(`
    CREATE TABLE IF NOT EXISTS reindex_log (
      url          TEXT PRIMARY KEY,
      submitted_at TEXT NOT NULL,
      reason       TEXT NOT NULL
    ) WITHOUT ROWID;
  `);
  return d;
}

async function liveSitemapUrls() {
  const res = await fetch(`${BASE_URL}/sitemap.xml`, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`sitemap fetch → ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(BASE_URL));
}

function unindexedMoneyPages() {
  const path = join(__dir, "output", "index-coverage-latest.json");
  if (!existsSync(path)) return [];
  const audit = JSON.parse(readFileSync(path, "utf8"));
  return (audit.notIndexed ?? [])
    .map((p) => p.url)
    .filter((u) => MONEY_PATH.test(new URL(u).pathname));
}

async function main() {
  const { GOOGLE_SERVICE_ACCOUNT_KEY_PATH, GSC_SITE_URL } = readEnv(["GOOGLE_SERVICE_ACCOUNT_KEY_PATH", "GSC_SITE_URL"]);
  const d = ensureStore();

  // Trigger 1 — sitemap change detection.
  const current = await liveSitemapUrls();
  const seen = new Set(kvGet(SEEN_KEY) ?? []);
  const newUrls = seen.size ? current.filter((u) => !seen.has(u)) : []; // first run just baselines
  kvSet(SEEN_KEY, current);

  // Trigger 2 — unindexed money pages past cooldown.
  const cutoff = new Date(Date.now() - COOLDOWN_DAYS * 864e5).toISOString();
  const recentlySubmitted = new Set(
    d.prepare("SELECT url FROM reindex_log WHERE submitted_at > ?").all(cutoff).map((r) => r.url),
  );
  const candidates = [
    ...newUrls.map((url) => ({ url, reason: "new-in-sitemap" })),
    ...unindexedMoneyPages().map((url) => ({ url, reason: "unindexed-money-page" })),
  ].filter((c, i, all) => !recentlySubmitted.has(c.url) && all.findIndex((x) => x.url === c.url) === i)
   .slice(0, MAX_PER_RUN);

  if (!candidates.length) {
    console.log("Reindex: nothing changed and nothing past cooldown — no-op.");
    return;
  }

  // Official sitemap resubmit: the supported crawl-discovery action for ecommerce pages.
  const gscToken = await getAccessToken(GOOGLE_SERVICE_ACCOUNT_KEY_PATH, "https://www.googleapis.com/auth/webmasters");
  const feed = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
  const site = encodeURIComponent(GSC_SITE_URL);
  const smRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${site}/sitemaps/${feed}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${gscToken}` },
  });
  if (!smRes.ok) throw new Error(`sitemap resubmit failed → ${smRes.status}: ${(await smRes.text()).slice(0, 200)}`);
  const ins = d.prepare("INSERT OR REPLACE INTO reindex_log (url, submitted_at, reason) VALUES (?, ?, ?)");
  const submittedAt = new Date().toISOString();
  for (const candidate of candidates) ins.run(candidate.url, submittedAt, candidate.reason);
  console.log(`Recrawl: sitemap resubmitted (${smRes.status}); ${candidates.length} commercial URL candidate(s) recorded for cooldown.`);
}

main().catch((e) => { console.error(`reindex failed: ${e.message}`); process.exit(1); });
