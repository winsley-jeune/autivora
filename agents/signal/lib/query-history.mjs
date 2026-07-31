// Tracks query impressions across Signal runs so new_queries can be computed week-over-week
// without needing a full snapshot archive — just the last-seen impression count per query.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const HISTORY_PATH = join(__dir, "..", "state", "query-history.json");

export function loadQueryHistory() {
  if (!existsSync(HISTORY_PATH)) return { updatedAt: null, queries: {} };
  return JSON.parse(readFileSync(HISTORY_PATH, "utf8"));
}

export function saveQueryHistory(history) {
  mkdirSync(dirname(HISTORY_PATH), { recursive: true });
  writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}

// A query counts as "new" if it wasn't seen last run, or its impressions grew ≥50% since then.
export function computeNewQueries(currentQueries, history) {
  const prev = history.queries || {};
  const newOnes = [];
  for (const row of currentQueries) {
    const key = row.keys[0];
    const prevImpr = prev[key]?.impressions ?? 0;
    if (prevImpr === 0 || row.impressions >= prevImpr * 1.5) {
      newOnes.push({
        query: key,
        impressions: row.impressions,
        clicks: row.clicks,
        avgPosition: row.position,
        previousImpressions: prevImpr,
      });
    }
  }
  return newOnes.sort((a, b) => b.impressions - a.impressions);
}

// Rebuilt from the current window only — a query that drops out of the top rows for a while
// and later returns will read as "new" again rather than "returning." That's by design, not a
// bug to fix later: at this stage a query resurfacing after a gap is worth Signal's attention
// again regardless of whether it technically appeared before.
export function updateQueryHistory(currentQueries, runAt) {
  const queries = {};
  for (const row of currentQueries) {
    queries[row.keys[0]] = { impressions: row.impressions, lastSeen: runAt };
  }
  return { updatedAt: runAt, queries };
}
