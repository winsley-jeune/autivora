#!/usr/bin/env node
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { listEconomics, evaluateRunningExperiments, ensureProfitSchema } from "../lib/profit-control.mjs";
import { loadStoreState, updateConstraint } from "../lib/store-state.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const state = loadStoreState();
const economics = listEconomics(state.limits);
const complete = economics.filter((x) => x.complete);
const eligible = complete.filter((x) => x.passesMarginGate);
const decisions = evaluateRunningExperiments();
const snapshotPath = join(root, "agents", "analytics", "output", "snapshot-latest.json");
const snapshot = existsSync(snapshotPath) ? JSON.parse(readFileSync(snapshotPath, "utf8")) : null;
const organicSessions = snapshot?.ga4?.byChannel?.find((x) => x.sessionDefaultChannelGroup === "Organic Search")?.sessions ?? 0;
const organicOrders = snapshot?.shopify?.organicOrderCount ?? 0;
let constraint = "qualified_traffic";
// Existing-catalog cost completeness must not hide observed funnel failure. Once the store has
// enough organic sessions to learn from but no organic orders, conversion is the operating
// constraint. Unit economics remain a mandatory launch gate for NEW offers in offer-launch.mjs.
if (organicSessions >= 50 && organicOrders === 0) constraint = "conversion";
else if (!eligible.length) constraint = complete.length ? "offer_margin" : "unit_economics";
updateConstraint(constraint, { economicsRows: economics.length, completeEconomics: complete.length, eligibleOffers: eligible.length, organicSessions, organicOrders, experimentDecisions: decisions.length });
const db = ensureProfitSchema();
const experiments = Object.fromEntries(db.prepare("SELECT status,COUNT(*) count FROM profit_experiments GROUP BY status").all().map((x) => [x.status,x.count]));
const actions = db.prepare("SELECT COUNT(*) count FROM profit_actions WHERE status='pending'").get().count;
const report = { generatedAt: new Date().toISOString(), constraint, economics: { total: economics.length, complete: complete.length, marginEligible: eligible.length }, funnel: { organicSessions, organicOrders }, experiments, pendingActions: actions, decisions };
mkdirSync(join(root,"agents","analytics","output"),{recursive:true});
writeFileSync(join(root,"agents","analytics","output","profit-controller-latest.json"),`${JSON.stringify(report,null,2)}\n`);
console.log(`Profit controller: constraint=${constraint}; economics=${complete.length}/${economics.length} complete; eligible=${eligible.length}; experiment actions=${actions}`);
