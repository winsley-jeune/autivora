#!/usr/bin/env node
// Resumable daily orchestrator. Workflow state lives in SQLite; logs are diagnostic only.
// A failed stage can be retried without repeating completed paid or mutating work.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { acquireWorkflowLease, finishWorkflow } from "../lib/control-plane.mjs";
import { latestShopifyCatalogSnapshot } from "../lib/shopify-catalog.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export const STAGES = [
  { name: "catalog-sync", args: ["run", "catalog:sync"], timeoutMs: 3 * MINUTE, attempts: 3, lane: "catalog" },
  { name: "analytics", args: ["run", "analytics:run"], timeoutMs: 10 * MINUTE, lane: "monitoring" },
  { name: "product-seo", args: ["run", "seo:products"], timeoutMs: 15 * MINUTE, lane: "catalog", needsCatalog: true },
  { name: "catalog-autonomous", args: ["run", "catalog:autonomous"], timeoutMs: 10 * MINUTE, lane: "catalog", needsCatalog: true, needsSeo: true },
  { name: "reindex", args: ["run", "analytics:reindex"], timeoutMs: 5 * MINUTE, lane: "monitoring" },
  { name: "signal", args: ["run", "signal:run"], timeoutMs: 8 * MINUTE, lane: "monitoring" },
  { name: "herald", args: ["run", "herald:run"], timeoutMs: 5 * MINUTE, lane: "monitoring" },
  { name: "envoy", args: ["run", "envoy:run"], timeoutMs: 5 * MINUTE, lane: "monitoring" },
  { name: "dropship-observe", args: ["run", "dropship:observe"], timeoutMs: 10 * MINUTE, lane: "monitoring" },
  { name: "dropship-scout", args: ["run", "dropship:run"], timeoutMs: 10 * MINUTE, lane: "monitoring" },
  { name: "scoreboard", args: ["run", "scoreboard"], timeoutMs: 2 * MINUTE, lane: "monitoring" },
];

export function localDay(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function runCommand(stage, { cwd = root } = {}) {
  return new Promise((resolve, reject) => {
    const grouped = process.platform !== "win32";
    const child = spawn("npm", stage.args, { cwd, stdio: "inherit", env: process.env, detached: grouped });
    const terminate = (signal) => {
      try { grouped ? process.kill(-child.pid, signal) : child.kill(signal); } catch {}
    };
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      terminate("SIGTERM");
      setTimeout(() => terminate("SIGKILL"), 5_000).unref();
    }, stage.timeoutMs);
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("exit", (code, signal) => {
      clearTimeout(timer);
      if (code === 0) return resolve();
      reject(new Error(timedOut
        ? `${stage.name} timed out after ${Math.round(stage.timeoutMs / 1000)}s`
        : `${stage.name} exited ${code ?? `on ${signal}`}`));
    });
  });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function executeStage(stage, day, {
  command = runCommand,
  sleep = wait,
  acquire = acquireWorkflowLease,
  finish = finishWorkflow,
} = {}) {
  const lease = acquire({ workflow: `daily-stage:${stage.name}`, runKey: day, leaseMs: stage.timeoutMs + MINUTE });
  if (!lease.acquired) {
    const ok = lease.reason === "complete";
    console.log(`[daily ${day}] ${stage.name}: ${ok ? "already complete" : `skipped (${lease.reason})`}.`);
    return { name: stage.name, ok, reason: lease.reason };
  }
  let error;
  for (let attempt = 1; attempt <= (stage.attempts ?? 1); attempt += 1) {
    try {
      console.log(`[daily ${day}] ${stage.name}: attempt ${attempt}/${stage.attempts ?? 1}.`);
      await command(stage);
      finish(lease.run.id);
      return { name: stage.name, ok: true };
    } catch (caught) {
      error = caught;
      console.error(`[daily ${day}] ${stage.name}: ${caught.message}`);
      if (attempt < (stage.attempts ?? 1)) await sleep(5_000 * (4 ** (attempt - 1)));
    }
  }
  finish(lease.run.id, { status: "failed", error: error?.message ?? "unknown stage failure" });
  return { name: stage.name, ok: false, error: error?.message ?? "unknown stage failure" };
}

function hasFreshCatalog(now = new Date()) {
  const snapshot = latestShopifyCatalogSnapshot();
  return Boolean(snapshot?.complete && Date.parse(snapshot.observedAt) >= now.getTime() - 26 * 60 * MINUTE);
}

export async function runDailyPipeline({
  now = new Date(),
  stages = STAGES,
  execute = executeStage,
  catalogFresh = hasFreshCatalog,
  acquire = acquireWorkflowLease,
  finish = finishWorkflow,
} = {}) {
  const day = localDay(now);
  // Worst case is about 90 minutes when every stage reaches its deadline. Keep the global lease
  // longer than that total so a second scheduler cannot enter while the final stage is alive.
  const pipeline = acquire({ workflow: "daily-pipeline", runKey: day, leaseMs: 100 * MINUTE });
  if (!pipeline.acquired) {
    console.log(`[daily ${day}] pipeline no-op (${pipeline.reason}).`);
    return { day, acquired: false, reason: pipeline.reason, results: [] };
  }

  const results = [];
  let catalogReady = false;
  let seoReady = false;
  try {
    for (const stage of stages) {
      if (stage.needsCatalog && !catalogReady) {
        const skipped = { name: stage.name, ok: false, skipped: true, reason: "no fresh complete catalog" };
        console.error(`[daily ${day}] ${stage.name}: skipped (${skipped.reason}).`);
        results.push(skipped);
        continue;
      }
      if (stage.needsSeo && !seoReady) {
        const skipped = { name: stage.name, ok: false, skipped: true, reason: "product SEO incomplete" };
        console.error(`[daily ${day}] ${stage.name}: skipped (${skipped.reason}).`);
        results.push(skipped);
        continue;
      }
      const result = await execute(stage, day);
      results.push(result);
      if (stage.name === "catalog-sync") catalogReady = result.ok || catalogFresh(now);
      if (stage.name === "product-seo") seoReady = result.ok;
    }

    const failed = results.filter((result) => !result.ok);
    finish(pipeline.run.id, failed.length
      ? { status: "failed", error: failed.map((item) => `${item.name}: ${item.error ?? item.reason}`).join("; ") }
      : undefined);
    console.log(`[daily ${day}] pipeline ${failed.length ? `incomplete (${failed.length} stage(s))` : "done"}.`);
    return { day, acquired: true, results, complete: failed.length === 0 };
  } catch (error) {
    finish(pipeline.run.id, { status: "failed", error: error.message });
    throw error;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const result = await runDailyPipeline();
  // EX_TEMPFAIL lets the shell distinguish an active lease from a successful completed day.
  if (!result.acquired && result.reason === "running") process.exit(75);
  if (result.acquired && !result.complete) process.exitCode = 1;
}
