#!/usr/bin/env node
// Reindex routine — pushes changed/unindexed money pages at Google instead of waiting to be
// discovered. Runs in the daily loop right after the analytics snapshot (and safe to run
// manually anytime): it acts only when something actually changed, so most days it's a no-op.
//
// What counts as "changed" (the triggers, checked in order):
//   1. NEW URLs in the live sitemap since the last run (e.g. the autivara-* slug renames, a
//      published collection) — first-seen URLs are exactly what Google doesn't know exists.
//   2. Known-unindexed product/collection pages from the freshest index-coverage audit that
//      haven't been (re)submitted within the cooldown.
//
// How it pushes (both via the existing service-account JWT client):
//   - Google Indexing API urlNotifications:publish (URL_UPDATED). Google documents this API
//     for job-posting/livestream pages; in practice it accepts other URLs but may ignore
//     them, and the service account must be a verified OWNER of the GSC property or every
//     call 403s. Treated as a nudge, not a guarantee.
//   - Search Console sitemaps.submit — re-submits sitemap.xml so changed URLs re-enter the
//     crawl queue the officially supported way.
//
// State lives in agents.db (reindex_log + kv sitemap snapshot) per the no-JSON-stores rule.
// Caps: MAX_PER_RUN 30 (Indexing API default quota is 200/day), COOLDOWN_DAYS 7 per URL.
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

  // Push 1 — Indexing API notifications.
  const token = await getAccessToken(GOOGLE_SERVICE_ACCOUNT_KEY_PATH, "https://www.googleapis.com/auth/indexing");
  const ins = d.prepare("INSERT OR REPLACE INTO reindex_log (url, submitted_at, reason) VALUES (?, ?, ?)");
  let ok = 0, failed = 0;
  for (const c of candidates) {
    const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: c.url, type: "URL_UPDATED" }),
    });
    if (res.ok) {
      ok++;
      ins.run(c.url, new Date().toISOString(), c.reason);
      console.log(`  submitted [${c.reason}] ${c.url.replace(BASE_URL, "")}`);
    } else {
      failed++;
      const body = (await res.text()).slice(0, 160);
      console.warn(`  FAILED ${res.status} ${c.url.replace(BASE_URL, "")} — ${body}`);
      if (res.status === 403) {
        console.warn("  (403 = the service account is not an OWNER of the GSC property — add it under Settings → Users and permissions → Add user as Owner, then re-run.)");
        break; // every further call will 403 too
      }
    }
    await sleep(300);
  }

  // Push 2 — official sitemap resubmit so everything re-enters the crawl queue.
  const gscToken = await getAccessToken(GOOGLE_SERVICE_ACCOUNT_KEY_PATH, "https://www.googleapis.com/auth/webmasters");
  const feed = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
  const site = encodeURIComponent(GSC_SITE_URL);
  const smRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${site}/sitemaps/${feed}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${gscToken}` },
  });
  console.log(`Reindex: ${ok} URL(s) submitted, ${failed} failed | sitemap resubmit → ${smRes.status}${smRes.ok ? " ok" : ""}`);
}

main().catch((e) => { console.error(`reindex failed: ${e.message}`); process.exit(1); });
