// Reads the analytics agent's dated snapshot history (agents/analytics/output/history/) so
// Signal can score a checkback against the actual metric trail for a page+query, instead of
// comparing a single before number (frozen in the task's `evidence` at creation time) against
// a single after number. Without this, the only "after" data point is whatever snapshot-latest
// happens to be on the day Signal runs — no trend, no way to tell a real step-change from noise.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const HISTORY_DIR = join(__dir, "..", "..", "analytics", "output", "history");

let cachedDates = null;
function listDates() {
  if (cachedDates) return cachedDates;
  if (!existsSync(HISTORY_DIR)) return (cachedDates = []);
  cachedDates = readdirSync(HISTORY_DIR)
    .filter((f) => /^snapshot-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.slice("snapshot-".length, -".json".length))
    .sort();
  return cachedDates;
}

function loadSnapshot(date) {
  return JSON.parse(readFileSync(join(HISTORY_DIR, `snapshot-${date}.json`), "utf8"));
}

function metricForPageQuery(snapshot, targetUrl, targetQuery) {
  const row = (snapshot.searchConsole?.pageQueries || []).find((r) => {
    try {
      return new URL(r.keys[0]).pathname === targetUrl && r.keys[1] === targetQuery;
    } catch {
      return false;
    }
  });
  if (!row) return null;
  return { impressions: row.impressions, clicks: row.clicks, ctr: Number(row.ctr.toFixed(4)), position: Number(row.position.toFixed(1)) };
}

// Returns the real day-by-day trail between `fromDate` (inclusive) and today for one
// page+query, from whatever dated snapshots actually exist — gappy is fine and expected
// (the analytics agent doesn't necessarily run every single day).
export function getMetricSeries(targetUrl, targetQuery, fromDate) {
  const dates = listDates().filter((d) => d >= fromDate);
  const series = [];
  for (const date of dates) {
    const metric = metricForPageQuery(loadSnapshot(date), targetUrl, targetQuery);
    if (metric) series.push({ date, ...metric });
  }
  return series;
}
