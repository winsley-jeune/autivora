// HarborRank client — the agents' door into real SEO data (DataForSEO-backed: site audits
// today; keyword volume / SERP competitor endpoints as the bridge grows). Operator directive
// (2026-08-09): competitor analysis and SEO decisions run on measured data from this tool,
// not on LLM web-search impressions.
//
// HarborRank is the operator's local OpenSEO fork (~/Desktop/open-seo) exposing a thin
// Bearer-token REST bridge (/api/bridge/*, enabled only in local_noauth mode). Endpoints:
//   GET  /api/bridge/health
//   POST /api/bridge/audit          {startUrl, maxPages?}   -> {auditId, projectId, ...}
//   GET  /api/bridge/audit-results  ?auditId=&projectId=    -> {audit, issues}
// Requires .env: HARBORRANK_URL (e.g. http://localhost:3002), HARBORRANK_TOKEN.
// Fail-soft: agents treat HarborRank as an enrichment source — helpers return null when the
// tool is down or unconfigured rather than killing a daily run.
import { readOptionalEnv } from "./env.mjs";

function config() {
  const { HARBORRANK_URL, HARBORRANK_TOKEN } = readOptionalEnv(["HARBORRANK_URL", "HARBORRANK_TOKEN"]);
  if (!HARBORRANK_URL || !HARBORRANK_TOKEN) return null;
  return { url: HARBORRANK_URL.replace(/\/$/, ""), token: HARBORRANK_TOKEN };
}

async function bridge(method, path, body) {
  const cfg = config();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/api/bridge/${path}`, {
      method,
      headers: { Authorization: `Bearer ${cfg.token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return await res.json();
  } catch (e) {
    console.warn(`HarborRank unavailable (${e.message.slice(0, 120)}) — continuing without it.`);
    return null;
  }
}

export async function harborRankHealthy() {
  const res = await bridge("GET", "health");
  return res?.ok === true;
}

export async function startSiteAudit(startUrl, { maxPages } = {}) {
  return bridge("POST", "audit", { startUrl, ...(maxPages ? { maxPages } : {}) });
}

export async function getAuditResults(auditId, projectId) {
  return bridge("GET", `audit-results?auditId=${encodeURIComponent(auditId)}&projectId=${encodeURIComponent(projectId)}`);
}
