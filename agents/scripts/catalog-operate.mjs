#!/usr/bin/env node
// Autonomous catalog decision executor. Audit generation remains a separate expensive command;
// this consumes its exact catalog snapshot, independently verifies it, then publishes through
// deterministic gates and the versioned rollback-capable Shopify adapter.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { readEnv } from "../lib/env.mjs";
import { latestShopifyCatalogSnapshot } from "../lib/shopify-catalog.mjs";
import { acquireWorkflowLease, finishWorkflow } from "../lib/control-plane.mjs";
import { buildCatalogPatch } from "../lib/catalog-policy.mjs";
import { recordVerification } from "../lib/verification-store.mjs";
import { publishVerifiedProductPatch } from "../lib/shopify-product-publisher.mjs";
import { callCatalogVerification } from "../dropship/lib/anthropic.mjs";
import { categorySeoCoverage, seoEvidenceForProduct } from "../lib/product-seo-evidence.mjs";
import { managedCatalogScope } from "../lib/catalog-scope.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const dropshipDir = join(here, "..", "dropship");
const auditPath = join(dropshipDir, "output", "audit-latest.json");
const snapshot = latestShopifyCatalogSnapshot();
if (!snapshot?.complete) throw new Error("No complete Shopify catalog snapshot; run npm run catalog:sync first");
const scope = managedCatalogScope(snapshot);
const audit = JSON.parse(readFileSync(auditPath, "utf8"));
if (audit.scopeHash !== scope.hash) throw new Error("Managed catalog audit is stale; run npm run dropship:audit against the current publishable catalog");
if (!audit.auditComplete || audit.results?.length !== scope.managedCount) throw new Error("Managed catalog audit is incomplete; publishing is blocked");
const coverage = categorySeoCoverage(snapshot);
if (!coverage.ready) throw new Error(`Catalog category SEO evidence is incomplete (${coverage.complete}/${coverage.expected}; missing: ${coverage.missingCategories.join(", ")}); publishing is blocked`);

const lease = acquireWorkflowLease({ workflow: "catalog-operate", runKey: `${snapshot.hash}:${coverage.hash}`, leaseMs: 2 * 60 * 60 * 1000 });
if (!lease.acquired) {
  console.log(`Catalog operate: no-op (${lease.reason}) for ${snapshot.hash.slice(0, 12)}.`);
  process.exit(0);
}

try {
  const { ANTHROPIC_API_KEY } = readEnv(["ANTHROPIC_API_KEY"]);
  const prompt = readFileSync(join(dropshipDir, "prompt-catalog-verify.md"), "utf8");
  const facts = new Map(scope.products.map((p) => [String(p.id), p]));
  const candidates = [];
  const quarantined = [];
  for (const verdict of audit.results) {
    const liveProduct = facts.get(String(verdict.id));
    const product = liveProduct ? { ...liveProduct, seo_evidence: seoEvidenceForProduct(liveProduct, snapshot) } : liveProduct;
    try { candidates.push({ product, verdict, patch: buildCatalogPatch(product, verdict, { requireSeoEvidence: verdict.verdict !== "archive" }) }); }
    catch (error) { quarantined.push({ id: verdict.id, stage: "policy", error: error.message }); }
  }
  const { output } = await callCatalogVerification({ apiKey: ANTHROPIC_API_KEY, systemPrompt: prompt, userInput: { catalog_hash: snapshot.hash, candidates } });
  const decisions = new Map(output.decisions.map((d) => [String(d.id), d]));
  const published = [];
  const maxChanges = Number(process.env.CATALOG_MAX_CHANGES_PER_RUN ?? 5);
  const maxStatusChanges = Number(process.env.CATALOG_MAX_STATUS_CHANGES_PER_RUN ?? 1);
  let statusChanges = 0;
  for (const candidate of candidates) {
    const decision = decisions.get(String(candidate.product.id));
    if (!decision?.passed || Object.values(decision.checks ?? {}).some((v) => v !== true)) {
      quarantined.push({ id: candidate.product.id, stage: "verification", error: decision?.notes ?? "Verifier returned no decision" });
      continue;
    }
    if (published.length >= maxChanges) {
      quarantined.push({ id: candidate.product.id, stage: "budget", error: `Run mutation cap reached (${maxChanges})` });
      continue;
    }
    if (candidate.patch.status && candidate.patch.status !== candidate.product.status) {
      if (statusChanges >= maxStatusChanges) {
        quarantined.push({ id: candidate.product.id, stage: "budget", error: `Run status-change cap reached (${maxStatusChanges})` });
        continue;
      }
      statusChanges += 1;
    }
    const artifactKey = `shopify:catalog:${candidate.product.id}`;
    const artifactHash = createHash("sha256").update(JSON.stringify(candidate.patch)).digest("hex");
    recordVerification({ artifactKey, artifactHash, producer: "catalog-auditor/claude", verifier: "catalog-verifier/claude", kind: "catalog", passed: true, checks: decision.checks, notes: decision.notes });
    const result = await publishVerifiedProductPatch({ productId: candidate.product.id, patch: candidate.patch, artifactKey, artifactHash, verificationKind: "catalog" });
    published.push({ id: candidate.product.id, versionId: result.versionId ?? null, reconciled: result.reconciled });
  }
  const report = { completedAt: new Date().toISOString(), catalogHash: snapshot.hash, published, quarantined };
  mkdirSync(join(dropshipDir, "output"), { recursive: true });
  writeFileSync(join(dropshipDir, "output", "catalog-operate-latest.json"), JSON.stringify(report, null, 2));
  finishWorkflow(lease.run.id);
  console.log(`Catalog operate: ${published.length} verified change(s) live, ${quarantined.length} quarantined.`);
} catch (error) {
  finishWorkflow(lease.run.id, { status: "failed", error: error.message });
  throw error;
}
