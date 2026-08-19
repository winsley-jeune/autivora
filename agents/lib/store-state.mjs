// Store lifecycle and hard operating limits. Signal may request a transition, but code verifies
// the evidence gates. This prevents a model from enabling ads or scaling prematurely.
import { openDb, transactionSync } from "./db.mjs";

export const LIFECYCLES = ["bootstrap", "discovery", "validation", "paid_testing", "scaling", "defense"];
const DEFAULT_LIMITS = {
  max_daily_ai_usd: 25,
  max_daily_ad_usd: 0,
  minimum_contribution_margin_rate: 0.3,
  maximum_refund_rate: 0.08,
};

let ready = false;
function ensure() {
  const d = openDb();
  if (ready) return d;
  d.exec(`
    CREATE TABLE IF NOT EXISTS store_state (
      singleton INTEGER PRIMARY KEY CHECK(singleton = 1),
      lifecycle TEXT NOT NULL,
      current_constraint TEXT,
      limits TEXT NOT NULL,
      evidence TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    INSERT OR IGNORE INTO store_state(singleton, lifecycle, limits, evidence, updated_at)
    VALUES (1, 'bootstrap', '${JSON.stringify(DEFAULT_LIMITS)}', '{}', datetime('now'));
    CREATE TABLE IF NOT EXISTS cost_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      occurred_at TEXT NOT NULL,
      kind TEXT NOT NULL,
      amount_usd REAL NOT NULL CHECK(amount_usd >= 0),
      operation_key TEXT,
      detail TEXT NOT NULL
    );
  `);
  ready = true;
  return d;
}

export function loadStoreState() {
  const row = ensure().prepare("SELECT * FROM store_state WHERE singleton = 1").get();
  return { ...row, limits: JSON.parse(row.limits), evidence: JSON.parse(row.evidence) };
}

export function updateConstraint(constraint, evidence = {}) {
  ensure().prepare("UPDATE store_state SET current_constraint = ?, evidence = ?, updated_at = ? WHERE singleton = 1")
    .run(constraint, JSON.stringify(evidence), new Date().toISOString());
  return loadStoreState();
}

export function setLimits(patch) {
  const unknown = Object.keys(patch).filter((key) => !(key in DEFAULT_LIMITS));
  if (unknown.length) throw new Error(`Unknown operating limit(s): ${unknown.join(", ")}`);
  return transactionSync((d) => {
    const state = loadStoreState();
    const limits = { ...state.limits, ...patch };
    if (Object.values(limits).some((value) => !Number.isFinite(value) || value < 0)) throw new Error("Operating limits must be finite non-negative numbers");
    d.prepare("UPDATE store_state SET limits = ?, updated_at = ? WHERE singleton = 1")
      .run(JSON.stringify(limits), new Date().toISOString());
    return { ...state, limits };
  });
}

export function recordCost({ kind, amountUsd, operationKey = null, detail = {} }, now = new Date()) {
  if (!Number.isFinite(amountUsd) || amountUsd < 0) throw new Error("Cost must be a finite non-negative number");
  ensure().prepare("INSERT INTO cost_events(occurred_at, kind, amount_usd, operation_key, detail) VALUES (?, ?, ?, ?, ?)")
    .run(now.toISOString(), kind, amountUsd, operationKey, JSON.stringify(detail));
}

export function costToday(kind = null, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  const row = kind
    ? ensure().prepare("SELECT COALESCE(SUM(amount_usd), 0) total FROM cost_events WHERE substr(occurred_at,1,10) = ? AND kind = ?").get(day, kind)
    : ensure().prepare("SELECT COALESCE(SUM(amount_usd), 0) total FROM cost_events WHERE substr(occurred_at,1,10) = ?").get(day);
  return Number(row.total);
}

export function transitionLifecycle(target, evidence) {
  if (!LIFECYCLES.includes(target)) throw new Error(`Unknown lifecycle: ${target}`);
  return transactionSync((d) => {
    const state = loadStoreState();
    const currentIndex = LIFECYCLES.indexOf(state.lifecycle);
    const targetIndex = LIFECYCLES.indexOf(target);
    if (targetIndex > currentIndex + 1) throw new Error(`Cannot skip lifecycle stages (${state.lifecycle} -> ${target})`);
    if (targetIndex > currentIndex) assertLifecycleGate(target, evidence);
    d.prepare("UPDATE store_state SET lifecycle = ?, evidence = ?, updated_at = ? WHERE singleton = 1")
      .run(target, JSON.stringify(evidence ?? {}), new Date().toISOString());
    return { ...state, lifecycle: target, evidence: evidence ?? {} };
  });
}

export function assertLifecycleGate(target, e = {}) {
  const required = {
    discovery: ["commercial_pages_live", "checkout_verified", "analytics_verified", "fulfillment_verified"],
    validation: ["qualified_traffic_observed", "commercial_funnel_measured"],
    paid_testing: ["validated_offer", "attribution_verified", "allowable_cac_positive", "refund_path_verified", "hard_ad_caps_active"],
    scaling: ["profitable_paid_cohorts", "fulfillment_capacity_verified", "cash_constraint_verified"],
    defense: ["repeatable_profit", "retention_measured"],
  }[target] ?? [];
  const missing = required.filter((key) => e[key] !== true);
  if (missing.length) throw new Error(`Lifecycle gate ${target} missing: ${missing.join(", ")}`);
}
