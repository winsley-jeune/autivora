import { randomUUID } from "node:crypto";
import { openDb, transactionSync } from "./db.mjs";

const money = (n) => Number(Number(n).toFixed(2));
const rate = (n) => Number(Number(n).toFixed(4));

let ready = false;
export function ensureProfitSchema() {
  const db = openDb();
  if (ready) return db;
  db.exec(`
    CREATE TABLE IF NOT EXISTS unit_economics (
      product_key TEXT PRIMARY KEY, selling_price REAL NOT NULL, supplier_cost REAL,
      shipping_cost REAL, payment_fee_rate REAL, payment_fee_fixed REAL,
      expected_refund_rate REAL, fulfillment_cost REAL, currency TEXT NOT NULL,
      source TEXT NOT NULL, verified_at TEXT, updated_at TEXT NOT NULL, detail TEXT NOT NULL
    ) WITHOUT ROWID;
    CREATE TABLE IF NOT EXISTS profit_ledger (
      order_key TEXT NOT NULL, product_key TEXT NOT NULL, occurred_at TEXT NOT NULL,
      channel TEXT, quantity INTEGER NOT NULL, gross_revenue REAL NOT NULL,
      variable_cost REAL, contribution_profit REAL, complete INTEGER NOT NULL CHECK(complete IN (0,1)),
      detail TEXT NOT NULL, PRIMARY KEY(order_key, product_key)
    ) WITHOUT ROWID;
    CREATE TABLE IF NOT EXISTS profit_experiments (
      id TEXT PRIMARY KEY, target TEXT NOT NULL, metric TEXT NOT NULL, hypothesis TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft','running','retain','revert','inconclusive','stopped')),
      control TEXT NOT NULL, variant TEXT NOT NULL, minimum_sessions INTEGER NOT NULL,
      minimum_conversions INTEGER NOT NULL, minimum_lift REAL NOT NULL,
      started_at TEXT, review_after TEXT, decided_at TEXT, decision TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS experiment_observations (
      experiment_id TEXT NOT NULL, variant_key TEXT NOT NULL, observed_at TEXT NOT NULL,
      sessions INTEGER NOT NULL, conversions INTEGER NOT NULL, revenue REAL NOT NULL,
      contribution_profit REAL, complete INTEGER NOT NULL CHECK(complete IN (0,1)),
      detail TEXT NOT NULL, PRIMARY KEY(experiment_id, variant_key, observed_at),
      FOREIGN KEY(experiment_id) REFERENCES profit_experiments(id)
    );
    CREATE TABLE IF NOT EXISTS profit_actions (
      id TEXT PRIMARY KEY, experiment_id TEXT, action TEXT NOT NULL, target TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending','done','failed')), created_at TEXT NOT NULL,
      completed_at TEXT, detail TEXT NOT NULL
    );
  `);
  ready = true;
  return db;
}

export function calculateUnitEconomics(input, limits = {}) {
  const required = ["sellingPrice", "supplierCost", "shippingCost"];
  const missing = required.filter((key) => !Number.isFinite(input[key]) || input[key] < 0);
  if (missing.length) return { complete: false, missing, productKey: input.productKey };
  const refundRate = input.expectedRefundRate ?? 0;
  const fee = input.sellingPrice * (input.paymentFeeRate ?? 0.029) + (input.paymentFeeFixed ?? 0.3);
  const expectedRefundCost = input.sellingPrice * refundRate;
  const variableCost = input.supplierCost + input.shippingCost + (input.fulfillmentCost ?? 0) + fee + expectedRefundCost;
  const contributionProfit = input.sellingPrice - variableCost;
  const contributionMarginRate = input.sellingPrice > 0 ? contributionProfit / input.sellingPrice : -1;
  const requiredMarginRate = limits.minimum_contribution_margin_rate ?? 0.3;
  const requiredContribution = input.sellingPrice * requiredMarginRate;
  return {
    complete: true, productKey: input.productKey, sellingPrice: money(input.sellingPrice),
    variableCost: money(variableCost), contributionProfit: money(contributionProfit),
    contributionMarginRate: rate(contributionMarginRate),
    allowableCac: money(Math.max(0, contributionProfit - requiredContribution)),
    passesMarginGate: contributionMarginRate >= requiredMarginRate,
    components: { supplierCost: money(input.supplierCost), shippingCost: money(input.shippingCost), fulfillmentCost: money(input.fulfillmentCost ?? 0), paymentFees: money(fee), expectedRefundCost: money(expectedRefundCost) },
  };
}

export function upsertUnitEconomics(input, now = new Date()) {
  if (!input.productKey || !Number.isFinite(input.sellingPrice)) throw new Error("productKey and sellingPrice are required");
  ensureProfitSchema().prepare(`INSERT INTO unit_economics
    (product_key,selling_price,supplier_cost,shipping_cost,payment_fee_rate,payment_fee_fixed,expected_refund_rate,fulfillment_cost,currency,source,verified_at,updated_at,detail)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(product_key) DO UPDATE SET
    selling_price=excluded.selling_price,supplier_cost=excluded.supplier_cost,shipping_cost=excluded.shipping_cost,
    payment_fee_rate=excluded.payment_fee_rate,payment_fee_fixed=excluded.payment_fee_fixed,
    expected_refund_rate=excluded.expected_refund_rate,fulfillment_cost=excluded.fulfillment_cost,
    currency=excluded.currency,source=excluded.source,verified_at=excluded.verified_at,updated_at=excluded.updated_at,detail=excluded.detail`)
    .run(input.productKey,input.sellingPrice,input.supplierCost ?? null,input.shippingCost ?? null,input.paymentFeeRate ?? 0.029,input.paymentFeeFixed ?? 0.3,input.expectedRefundRate ?? 0,input.fulfillmentCost ?? 0,input.currency ?? "USD",input.source ?? "operator",input.verifiedAt ?? null,now.toISOString(),JSON.stringify(input.detail ?? {}));
}

export function listEconomics(limits = {}) {
  return ensureProfitSchema().prepare("SELECT * FROM unit_economics ORDER BY product_key").all().map((row) => calculateUnitEconomics({
    productKey: row.product_key, sellingPrice: row.selling_price, supplierCost: row.supplier_cost,
    shippingCost: row.shipping_cost, paymentFeeRate: row.payment_fee_rate, paymentFeeFixed: row.payment_fee_fixed,
    expectedRefundRate: row.expected_refund_rate, fulfillmentCost: row.fulfillment_cost,
  }, limits));
}

export function recordProfitLine(input) {
  const economics = calculateUnitEconomics(input, input.limits);
  const quantity = input.quantity ?? 1;
  const complete = economics.complete;
  ensureProfitSchema().prepare(`INSERT INTO profit_ledger(order_key,product_key,occurred_at,channel,quantity,gross_revenue,variable_cost,contribution_profit,complete,detail)
    VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(order_key,product_key) DO UPDATE SET channel=excluded.channel,quantity=excluded.quantity,gross_revenue=excluded.gross_revenue,variable_cost=excluded.variable_cost,contribution_profit=excluded.contribution_profit,complete=excluded.complete,detail=excluded.detail`)
    .run(String(input.orderKey),String(input.productKey),input.occurredAt ?? new Date().toISOString(),input.channel ?? null,quantity,input.grossRevenue,
      complete ? money(economics.variableCost * quantity) : null,complete ? money(input.grossRevenue - economics.variableCost * quantity) : null,complete ? 1 : 0,JSON.stringify({ missing: economics.missing ?? [], ...(input.detail ?? {}) }));
  return economics;
}

export function scoreOpportunity({ economics, demandScore = 0, deliveryScore = 0, competitionScore = 0, conversionEvidence = 0 }) {
  if (!economics?.complete || !economics.passesMarginGate) return { eligible: false, score: 0, reason: !economics?.complete ? "incomplete unit economics" : "margin gate failed" };
  const clamp = (x) => Math.max(0, Math.min(1, Number(x) || 0));
  const marginStrength = clamp(economics.contributionMarginRate);
  const score = 100 * (0.3 * clamp(demandScore) + 0.25 * marginStrength + 0.2 * clamp(deliveryScore) + 0.15 * clamp(competitionScore) + 0.1 * clamp(conversionEvidence));
  return { eligible: true, score: Number(score.toFixed(1)), reason: "verified economics and evidence", expectedContribution: economics.contributionProfit, allowableCac: economics.allowableCac };
}

export function createExperiment(input, now = new Date()) {
  if (!input.target || !input.hypothesis || !input.control || !input.variant) throw new Error("Experiment target, hypothesis, control, and variant are required");
  const experiment = { id: input.id ?? randomUUID(), status: "draft", metric: input.metric ?? "contribution_profit_per_session", minimumSessions: input.minimumSessions ?? 100, minimumConversions: input.minimumConversions ?? 5, minimumLift: input.minimumLift ?? 0.1 };
  ensureProfitSchema().prepare(`INSERT INTO profit_experiments(id,target,metric,hypothesis,status,control,variant,minimum_sessions,minimum_conversions,minimum_lift,created_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(experiment.id,input.target,experiment.metric,input.hypothesis,experiment.status,JSON.stringify(input.control),JSON.stringify(input.variant),experiment.minimumSessions,experiment.minimumConversions,experiment.minimumLift,now.toISOString());
  return experiment;
}

export function startExperiment(id, { reviewAfter }, now = new Date()) {
  const result = ensureProfitSchema().prepare("UPDATE profit_experiments SET status='running',started_at=?,review_after=? WHERE id=? AND status='draft'").run(now.toISOString(),reviewAfter,id);
  if (result.changes !== 1) throw new Error(`Experiment ${id} is not a draft`);
}

export function recordExperimentObservation(input, now = new Date()) {
  if (!["control","variant"].includes(input.variantKey)) throw new Error("variantKey must be control or variant");
  if ([input.sessions,input.conversions,input.revenue].some((x) => !Number.isFinite(x) || x < 0) || input.conversions > input.sessions) throw new Error("Invalid experiment observation");
  ensureProfitSchema().prepare(`INSERT INTO experiment_observations(experiment_id,variant_key,observed_at,sessions,conversions,revenue,contribution_profit,complete,detail)
    VALUES(?,?,?,?,?,?,?,?,?)`).run(input.experimentId,input.variantKey,now.toISOString(),input.sessions,input.conversions,input.revenue,input.contributionProfit ?? null,input.complete === false ? 0 : 1,JSON.stringify(input.detail ?? {}));
}

function armValue(row) { return row.sessions ? (row.contribution_profit ?? 0) / row.sessions : 0; }
export function decideExperiment({ experiment, control, variant, now = new Date() }) {
  if (!control?.complete || !variant?.complete) return { status: "inconclusive", reason: "incomplete observations" };
  const enough = control.sessions >= experiment.minimumSessions && variant.sessions >= experiment.minimumSessions && (control.conversions + variant.conversions) >= experiment.minimumConversions;
  if (!enough) return { status: "running", reason: "sample gate not met" };
  const controlValue = armValue(control); const variantValue = armValue(variant);
  const lift = controlValue === 0 ? (variantValue > 0 ? 1 : 0) : (variantValue - controlValue) / Math.abs(controlValue);
  if (variantValue < 0 || lift <= -experiment.minimumLift) return { status: "revert", reason: "variant reduced contribution profit", lift: rate(lift) };
  if (variant.conversions < 2) return { status: "inconclusive", reason: "variant conversion evidence too weak", lift: rate(lift) };
  if (lift >= experiment.minimumLift) return { status: "retain", reason: "variant increased contribution profit after sample gate", lift: rate(lift) };
  return { status: "inconclusive", reason: "lift below decision threshold", lift: rate(lift) };
}

export function evaluateRunningExperiments(now = new Date()) {
  const db = ensureProfitSchema();
  const rows = db.prepare("SELECT * FROM profit_experiments WHERE status='running'").all();
  return transactionSync((tx) => rows.map((row) => {
    const observations = tx.prepare(`SELECT variant_key,SUM(sessions) sessions,SUM(conversions) conversions,SUM(revenue) revenue,SUM(contribution_profit) contribution_profit,MIN(complete) complete FROM experiment_observations WHERE experiment_id=? GROUP BY variant_key`).all(row.id);
    const result = decideExperiment({ experiment: { minimumSessions: row.minimum_sessions, minimumConversions: row.minimum_conversions, minimumLift: row.minimum_lift }, control: observations.find((x) => x.variant_key === "control"), variant: observations.find((x) => x.variant_key === "variant"), now });
    if (["retain","revert","inconclusive"].includes(result.status)) {
      tx.prepare("UPDATE profit_experiments SET status=?,decided_at=?,decision=? WHERE id=?").run(result.status,now.toISOString(),JSON.stringify(result),row.id);
      if (["retain","revert"].includes(result.status)) tx.prepare("INSERT INTO profit_actions(id,experiment_id,action,target,status,created_at,detail) VALUES(?,?,?,?, 'pending',?,?)").run(randomUUID(),row.id,result.status,row.target,now.toISOString(),JSON.stringify(result));
    }
    return { id: row.id, target: row.target, ...result };
  }));
}
