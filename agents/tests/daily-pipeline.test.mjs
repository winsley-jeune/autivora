import test from "node:test";
import assert from "node:assert/strict";
import { executeStage, runDailyPipeline } from "../scripts/daily-pipeline.mjs";

test("daily stage retries transient failures and records one completion", async () => {
  let calls = 0;
  const finishes = [];
  const result = await executeStage(
    { name: "catalog-sync", args: [], timeoutMs: 1000, attempts: 3 },
    "2026-08-23",
    {
      acquire: () => ({ acquired: true, run: { id: "stage-1" } }),
      finish: (...args) => finishes.push(args),
      sleep: async () => {},
      command: async () => { calls += 1; if (calls < 3) throw new Error("ECONNRESET"); },
    },
  );
  assert.equal(result.ok, true);
  assert.equal(calls, 3);
  assert.deepEqual(finishes, [["stage-1"]]);
});

test("daily pipeline rejects an overlapping run", async () => {
  let executed = false;
  const result = await runDailyPipeline({
    stages: [{ name: "analytics" }],
    acquire: () => ({ acquired: false, reason: "running" }),
    execute: async () => { executed = true; return { ok: true }; },
  });
  assert.equal(result.acquired, false);
  assert.equal(result.reason, "running");
  assert.equal(executed, false);
});

test("catalog failure skips dependent publication but monitoring continues", async () => {
  const called = [];
  const stages = [
    { name: "catalog-sync", lane: "catalog" },
    { name: "analytics", lane: "monitoring" },
    { name: "product-seo", lane: "catalog", needsCatalog: true },
    { name: "catalog-autonomous", lane: "catalog", needsCatalog: true, needsSeo: true },
    { name: "signal", lane: "monitoring" },
    { name: "scoreboard", lane: "monitoring" },
  ];
  const finishes = [];
  const result = await runDailyPipeline({
    stages,
    acquire: () => ({ acquired: true, run: { id: "pipeline-1" } }),
    finish: (...args) => finishes.push(args),
    catalogFresh: () => false,
    execute: async (stage) => {
      called.push(stage.name);
      return { name: stage.name, ok: stage.name !== "catalog-sync", error: "network failure" };
    },
  });
  assert.deepEqual(called, ["catalog-sync", "analytics", "signal", "scoreboard"]);
  assert.equal(result.complete, false);
  assert.equal(result.results.find((item) => item.name === "catalog-autonomous").skipped, true);
  assert.equal(finishes[0][1].status, "failed");
});

test("completed catalog and SEO stages permit autonomous operation on resume", async () => {
  const called = [];
  const stages = [
    { name: "catalog-sync" },
    { name: "product-seo", needsCatalog: true },
    { name: "catalog-autonomous", needsCatalog: true, needsSeo: true },
  ];
  const result = await runDailyPipeline({
    stages,
    acquire: () => ({ acquired: true, run: { id: "pipeline-2" } }),
    finish: () => {},
    execute: async (stage) => { called.push(stage.name); return { name: stage.name, ok: true, reason: "complete" }; },
  });
  assert.deepEqual(called, stages.map((stage) => stage.name));
  assert.equal(result.complete, true);
});

test("revenue constraint pauses distribution but executes revenue work", async () => {
  const called = [];
  const stages = [
    { name: "signal" },
    { name: "revenue-execute" },
    { name: "herald", pauseForRevenue: true },
    { name: "envoy", pauseForRevenue: true },
    { name: "scoreboard" },
  ];
  const result = await runDailyPipeline({
    stages,
    acquire: () => ({ acquired: true, run: { id: "pipeline-revenue" } }),
    finish: () => {},
    revenueConstraint: () => true,
    execute: async (stage) => { called.push(stage.name); return { name: stage.name, ok: true }; },
  });
  assert.deepEqual(called, ["signal", "revenue-execute", "scoreboard"]);
  assert.equal(result.complete, true);
  assert.equal(result.results.find((item) => item.name === "envoy").reason, "organic revenue constraint");
});
