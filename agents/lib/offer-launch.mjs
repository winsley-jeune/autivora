import { randomUUID } from 'node:crypto';
import { openDb } from './db.mjs';
import { calculateUnitEconomics, scoreOpportunity } from './profit-control.mjs';

let ready = false;
export function ensureOfferLaunchSchema() {
  const db = openDb();
  if (ready) return db;
  db.exec(`
    CREATE TABLE IF NOT EXISTS offer_launches (
      id TEXT PRIMARY KEY, product_key TEXT NOT NULL, product_handle TEXT, product_title TEXT NOT NULL,
      category_handle TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('preparing','testing','scale','kill','failed')),
      opportunity_score REAL NOT NULL, economics TEXT NOT NULL, evidence TEXT NOT NULL,
      shopify_collection_id TEXT, launched_at TEXT, review_after TEXT, decided_at TEXT,
      decision_reason TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS one_open_offer ON offer_launches(status) WHERE status IN ('preparing','testing');
    CREATE TABLE IF NOT EXISTS offer_creatives (
      launch_id TEXT NOT NULL, kind TEXT NOT NULL, status TEXT NOT NULL,
      shopify_image_id TEXT, prompt TEXT NOT NULL, verification TEXT,
      created_at TEXT NOT NULL, PRIMARY KEY(launch_id,kind),
      FOREIGN KEY(launch_id) REFERENCES offer_launches(id)
    ) WITHOUT ROWID;
    CREATE TABLE IF NOT EXISTS offer_observations (
      launch_id TEXT NOT NULL, day TEXT NOT NULL, sessions INTEGER NOT NULL, orders INTEGER NOT NULL,
      revenue REAL NOT NULL, contribution_profit REAL, refunds INTEGER, complete INTEGER NOT NULL,
      evidence TEXT NOT NULL, PRIMARY KEY(launch_id,day), FOREIGN KEY(launch_id) REFERENCES offer_launches(id)
    ) WITHOUT ROWID;
  `);
  ready = true;
  return db;
}

export function candidateEconomics(candidate, limits = {}) {
  return calculateUnitEconomics({ productKey:String(candidate.shopifyId), sellingPrice:Number(candidate.price),
    supplierCost:Number(candidate.landedCost), shippingCost:0, expectedRefundRate:limits.maximum_refund_rate ?? 0.08 }, limits);
}

export function evaluateLaunchCandidate(candidate, { now = new Date(), limits = {} } = {}) {
  const economics = candidateEconomics(candidate, limits);
  const ageDays = (now.getTime() - Date.parse(`${candidate.lastVerifiedOn}T23:59:59Z`)) / 86400000;
  const gates = {
    shopifyDraft: candidate.status === 'draft' && Boolean(candidate.shopifyId),
    freshSupplierEvidence: Number.isFinite(ageDays) && ageDays <= 3,
    stock: Number(candidate.stock) >= 10,
    delivery: Number(candidate.deliveryMax) > 0 && Number(candidate.deliveryMax) <= 30,
    margin: economics.complete && economics.passesMarginGate,
    demand: Number(candidate.orders ?? 0) >= 50 || Boolean(candidate.hypothesisId),
  };
  if (Object.values(gates).some((x) => !x)) return { eligible:false, score:0, gates, economics };
  const opportunity = scoreOpportunity({ economics, demandScore:Math.min(1,Math.log10(Number(candidate.orders ?? 50)+1)/4),
    deliveryScore:Math.max(0,1-Number(candidate.deliveryMax)/30), competitionScore:candidate.competition?.saturated ? 0.1 : 0.8,
    conversionEvidence:0 });
  return { eligible:opportunity.eligible, score:opportunity.score, gates, economics, opportunity };
}

export function selectLaunchCandidate(candidates, options = {}) {
  return candidates.map((candidate) => ({ candidate, evaluation:evaluateLaunchCandidate(candidate,options) }))
    .filter((x) => x.evaluation.eligible).sort((a,b) => b.evaluation.score-a.evaluation.score)[0] ?? null;
}

export function launchDecision({ sessions, orders, contributionProfit, refunds = 0, fulfilledOrders = orders }, limits = {}) {
  if (contributionProfit != null && contributionProfit < 0) return { status:'kill', reason:'negative contribution profit' };
  if (fulfilledOrders >= 5 && contributionProfit > 0 && refunds / Math.max(1,fulfilledOrders) <= (limits.maximum_refund_rate ?? 0.08)) return { status:'scale', reason:'five or more profitable fulfilled orders within refund limit' };
  if (sessions >= 150 && orders === 0) return { status:'kill', reason:'zero orders after 150 qualified sessions' };
  return { status:'testing', reason:'evidence gate not reached' };
}

export function reserveLaunch({ candidate, evaluation, categoryHandle }, now = new Date()) {
  const db = ensureOfferLaunchSchema();
  if (db.prepare("SELECT 1 FROM offer_launches WHERE status IN ('preparing','testing') LIMIT 1").get()) return null;
  const id = randomUUID();
  db.prepare(`INSERT INTO offer_launches(id,product_key,product_title,category_handle,status,opportunity_score,economics,evidence,created_at,updated_at)
    VALUES(?,?,?,?, 'preparing',?,?,?,?,?)`).run(id,String(candidate.shopifyId),candidate.title,categoryHandle,evaluation.score,JSON.stringify(evaluation.economics),JSON.stringify({ gates:evaluation.gates, hypothesisId:candidate.hypothesisId ?? null }),now.toISOString(),now.toISOString());
  return id;
}

export function activeLaunch() { return ensureOfferLaunchSchema().prepare("SELECT * FROM offer_launches WHERE status IN ('preparing','testing') ORDER BY created_at LIMIT 1").get() ?? null; }

