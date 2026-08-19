import test from "node:test";
import assert from "node:assert/strict";
import { recordEvidence, getEvidence, latestEvidence, requireUsableEvidence } from "../lib/evidence-store.mjs";

test("evidence records completeness, freshness, and observation horizon", () => {
  const observedAt = new Date("2026-08-17T12:00:00.000Z");
  recordEvidence({
    evidenceKey: "gsc:test-day", source: "gsc", kind: "queries", observedAt,
    dataThrough: "2026-08-16", maxAgeMs: 60_000, complete: true,
    completeness: { rows: 2 }, payload: [{ query: "test" }],
  });
  const fresh = getEvidence("gsc:test-day", { now: new Date("2026-08-17T12:00:30.000Z") });
  assert.equal(fresh.complete, true);
  assert.equal(fresh.stale, false);
  assert.equal(fresh.data_through, "2026-08-16T00:00:00.000Z");
  assert.deepEqual(fresh.payload, [{ query: "test" }]);
  assert.equal(getEvidence("gsc:test-day", { now: new Date("2026-08-17T12:01:01.000Z") }).stale, true);
});

test("usable evidence rejects incomplete or stale observations", () => {
  recordEvidence({
    evidenceKey: "shopify:partial", source: "shopify-test", kind: "orders",
    observedAt: "2026-08-17T12:00:00Z", maxAgeMs: 60_000, complete: false,
    completeness: { reason: "page ceiling" }, payload: [],
  });
  assert.equal(latestEvidence("shopify-test", "orders").complete, false);
  assert.throws(() => requireUsableEvidence("shopify-test", "orders"), /No complete, fresh/);
});
