import test from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";

process.env.AGENTS_DB_PATH = join(tmpdir(), `autivora-control-plane-${randomUUID()}.db`);
const {
  acquireWorkflowLease,
  finishWorkflow,
  reserveOperation,
  completeOperation,
  failOperation,
} = await import("../lib/control-plane.mjs");
const { mutateTaskStore, claimTask, loadTasks, releaseExpiredClaims } = await import("../signal/lib/task-store.mjs");
const { loadStoreState, transitionLifecycle, setLimits, recordCost, costToday } = await import("../lib/store-state.mjs");
const { assignQueryOwner, getQueryOwner } = await import("../lib/page-ownership.mjs");
const { recordVerification, requirePassingVerification } = await import("../lib/verification-store.mjs");

test("workflow lease permits only one concurrent run key", () => {
  const first = acquireWorkflowLease({ workflow: "signal", runKey: "2026-08-17" });
  assert.equal(first.acquired, true);
  const second = acquireWorkflowLease({ workflow: "signal", runKey: "2026-08-17" });
  assert.equal(second.acquired, false);
  assert.equal(second.reason, "running");
  finishWorkflow(first.run.id);
  const third = acquireWorkflowLease({ workflow: "signal", runKey: "2026-08-17" });
  assert.equal(third.acquired, false);
  assert.equal(third.reason, "complete");
});

test("expired workflow lease can be recovered", () => {
  const start = new Date("2026-08-17T10:00:00.000Z");
  const first = acquireWorkflowLease({ workflow: "scout", runKey: "day-1", leaseMs: 1000, now: start });
  const recovered = acquireWorkflowLease({ workflow: "scout", runKey: "day-1", now: new Date("2026-08-17T10:00:02.000Z") });
  assert.equal(recovered.acquired, true);
  assert.notEqual(recovered.run.id, first.run.id);
});

test("completed operation returns the original result on retry", () => {
  const first = reserveOperation({ operationKey: "shopify:create:sku-1", kind: "shopify.product.create", request: { sku: "sku-1" } });
  assert.equal(first.reserved, true);
  completeOperation(first.operation.id, { id: 123, status: "draft" });
  const retry = reserveOperation({ operationKey: "shopify:create:sku-1", kind: "shopify.product.create", request: { sku: "sku-1" } });
  assert.equal(retry.reserved, false);
  assert.equal(retry.reason, "complete");
  assert.deepEqual(retry.result, { id: 123, status: "draft" });
});

test("failed operation may be retried and records another attempt", () => {
  const first = reserveOperation({ operationKey: "shopify:create:sku-2", kind: "shopify.product.create", request: { sku: "sku-2" } });
  failOperation(first.operation.id, "network failure");
  const retry = reserveOperation({ operationKey: "shopify:create:sku-2", kind: "shopify.product.create", request: { sku: "sku-2" } });
  assert.equal(retry.reserved, true);
  assert.equal(retry.operation.attempts, 2);
});

test("expired task claims return to the executable queue", async () => {
  await mutateTaskStore((store) => {
    store.tasks.push({ id: store.nextId++, agent: "linker", status: "open", created_at: "2026-08-17T00:00:00.000Z" });
    return store;
  });
  const task = loadTasks().tasks.at(-1);
  await claimTask(task.id, "test-worker");
  await mutateTaskStore((store) => {
    const claimed = store.tasks.find((item) => item.id === task.id);
    claimed.claim_expires_at = "2026-08-17T00:00:00.000Z";
    releaseExpiredClaims(store, "2026-08-17T01:00:00.000Z");
    return store;
  });
  const recovered = loadTasks().tasks.find((item) => item.id === task.id);
  assert.equal(recovered.status, "open");
  assert.equal(recovered.claimed_by, undefined);
  assert.match(recovered.release_notes.at(-1).reason, /lease expired/);
});

test("store lifecycle cannot advance without deterministic gates", () => {
  assert.equal(loadStoreState().lifecycle, "bootstrap");
  assert.throws(() => transitionLifecycle("discovery", {}), /missing/);
  const state = transitionLifecycle("discovery", {
    commercial_pages_live: true,
    checkout_verified: true,
    analytics_verified: true,
    fulfillment_verified: true,
  });
  assert.equal(state.lifecycle, "discovery");
});

test("budgets and cost events are durable", () => {
  const state = setLimits({ max_daily_ai_usd: 12 });
  assert.equal(state.limits.max_daily_ai_usd, 12);
  const now = new Date("2026-08-17T12:00:00.000Z");
  recordCost({ kind: "ai", amountUsd: 1.25 }, now);
  recordCost({ kind: "ai", amountUsd: 0.75 }, now);
  assert.equal(costToday("ai", now), 2);
});

test("commercial queries cannot be assigned to blogs", () => {
  assert.throws(() => assignQueryOwner({
    clusterKey: "car-diffusers", query: "car diffuser", intent: "category",
    ownerUrl: "/blog/car-diffusers", ownerType: "blog", rationale: "traffic",
  }), /cannot be owned|must be owned/);
  assignQueryOwner({
    clusterKey: "car-diffusers", query: "car diffuser", intent: "category",
    ownerUrl: "/collections/car-diffusers", ownerType: "category", rationale: "broad commercial intent",
  });
  assert.equal(getQueryOwner("car-diffusers").owner_type, "category");
});

test("artifact producer cannot self-verify and publishers require a pass", () => {
  const identity = { artifactKey: "product:one", artifactHash: "abc123", kind: "content" };
  assert.throws(() => recordVerification({ ...identity, producer: "product", verifier: "product", passed: true, checks: {} }), /cannot verify/);
  recordVerification({ ...identity, producer: "product", verifier: "content-qa", passed: false, checks: { factual: false } });
  assert.throws(() => requirePassingVerification(identity), /lacks passing/);
  recordVerification({ ...identity, producer: "product", verifier: "content-qa-v2", passed: true, checks: { factual: true } });
  assert.equal(requirePassingVerification(identity).passed, true);
});
