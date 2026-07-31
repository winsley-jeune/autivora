// Builds the internal link graph for blog posts from a live crawl (not the TS source files —
// crawling the rendered site is simpler and can't drift from what's actually published, since
// blog-data.ts resolves rewrites/retirements/release-scheduling before a page ever ships).
// Cached for a week (state/link-graph-cache.json) since this doesn't need to run daily — a
// linker task only fires on a new page or a detected orphan, not on a fixed cadence.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = join(__dir, "..", "state", "link-graph-cache.json");
const CACHE_TTL_MS = 6 * 24 * 60 * 60 * 1000;
const CONCURRENCY = 5;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchSitemapUrls(baseUrl) {
  const res = await fetch(`${baseUrl}/sitemap.xml`);
  if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function extractInternalLinks(html, baseUrl) {
  const links = new Set();
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    let href = m[1];
    if (href.startsWith(baseUrl)) href = href.slice(baseUrl.length);
    if (href.startsWith("/") && !href.startsWith("//")) links.add(href.split("#")[0].split("?")[0]);
  }
  return links;
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function buildLinkGraph(baseUrl) {
  const allUrls = await fetchSitemapUrls(baseUrl);
  const blogUrls = allUrls.filter((u) => u.includes("/blog/") && !u.endsWith("/blog/"));

  const pages = await mapWithConcurrency(blogUrls, CONCURRENCY, async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return { url, ok: false, links: [] };
      const html = await res.text();
      await sleep(100);
      return { url, ok: true, links: [...extractInternalLinks(html, baseUrl)] };
    } catch {
      return { url, ok: false, links: [] };
    }
  });

  // Inbound count is post-to-post only — a link from a collection/product page doesn't count,
  // even though it would help the page's real crawl budget. That's intentional: this is a
  // content-graph audit for the linker agent (whose job is post-to-post linking), not a full
  // site-wide inbound-link audit. Don't "fix" this to include non-blog sources.
  const blogPaths = new Set(blogUrls.map((u) => new URL(u).pathname));
  const inboundCount = new Map([...blogPaths].map((p) => [p, 0]));

  for (const page of pages) {
    if (!page.ok) continue;
    const selfPath = new URL(page.url).pathname;
    for (const link of page.links) {
      if (blogPaths.has(link) && link !== selfPath) {
        inboundCount.set(link, (inboundCount.get(link) ?? 0) + 1);
      }
    }
  }

  const orphaned = [...blogPaths].filter((p) => (inboundCount.get(p) ?? 0) === 0);
  const noProductLink = pages
    .filter((p) => p.ok && !p.links.some((l) => l.startsWith("/product/")))
    .map((p) => new URL(p.url).pathname);

  return {
    crawledAt: new Date().toISOString(),
    totalBlogPages: blogPaths.size,
    orphaned,
    noProductLink,
  };
}

export async function getLinkGraph(baseUrl, { forceRefresh = false } = {}) {
  if (!forceRefresh && existsSync(CACHE_PATH)) {
    const cached = JSON.parse(readFileSync(CACHE_PATH, "utf8"));
    const age = Date.now() - new Date(cached.crawledAt).getTime();
    if (age < CACHE_TTL_MS) return cached;
  }
  const fresh = await buildLinkGraph(baseUrl);
  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(fresh, null, 2));
  return fresh;
}
