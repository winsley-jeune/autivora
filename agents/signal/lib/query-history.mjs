// Tracks query impressions across Signal runs so new_queries can be computed week-over-week
// without needing a full snapshot archive — just the last-seen impression count per query.
// Stored in agents/state/agents.db (signal_query_history); the legacy query-history.json is
// auto-imported on first open.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { openDb, transactionSync, kvGet, kvSet, importLegacyJson } from "../../lib/db.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const LEGACY_PATH = join(__dir, "..", "state", "query-history.json");
const UPDATED_AT_KEY = "signal.query_history_updated_at";

let ready = false;
function ensureStore() {
  const d = openDb();
  if (ready) return d;
  d.exec(`
    CREATE TABLE IF NOT EXISTS signal_query_history (
      query       TEXT PRIMARY KEY,
      impressions REAL NOT NULL,
      last_seen   TEXT
    ) WITHOUT ROWID;
  `);
  importLegacyJson("migrated.signal_query_history", LEGACY_PATH, (parsed) => {
    persist(parsed);
  });
  ready = true;
  return d;
}

function persist(history) {
  const d = openDb();
  d.prepare("DELETE FROM signal_query_history").run();
  const ins = d.prepare("INSERT INTO signal_query_history (query, impressions, last_seen) VALUES (?, ?, ?)");
  for (const [q, v] of Object.entries(history.queries ?? {})) ins.run(q, v.impressions ?? 0, v.lastSeen ?? null);
  kvSet(UPDATED_AT_KEY, history.updatedAt ?? null);
}

export function loadQueryHistory() {
  const d = ensureStore();
  const queries = {};
  for (const r of d.prepare("SELECT query, impressions, last_seen FROM signal_query_history").all()) {
    queries[r.query] = { impressions: r.impressions, lastSeen: r.last_seen };
  }
  return { updatedAt: kvGet(UPDATED_AT_KEY), queries };
}

export function saveQueryHistory(history) {
  ensureStore();
  transactionSync(() => persist(history));
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
