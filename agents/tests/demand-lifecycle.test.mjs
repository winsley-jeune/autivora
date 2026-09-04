import test from "node:test";
import assert from "node:assert/strict";
import { staleHypotheses, retireStaleHypotheses } from "../dropship/lib/demand.mjs";

test("hypotheses with candidates but no imports become stale", () => {
  const catalog = { demandHypotheses: [
    { id: "dead", status: "active", yields: { scans: 3, candidates: 40, imports: 0 } },
    { id: "productive", status: "active", yields: { scans: 5, candidates: 4, imports: 1 } },
  ] };
  assert.deepEqual(staleHypotheses(catalog).map((h) => h.id), ["dead"]);
});

test("stale hypotheses are retired deterministically to free research slots", () => {
  const catalog = { demandHypotheses: [
    { id: "dead", status: "active", yields: { scans: 8, candidates: 65, imports: 0 } },
  ] };
  const retired = retireStaleHypotheses(catalog, "2026-09-03");
  assert.equal(retired.length, 1);
  assert.equal(catalog.demandHypotheses[0].status, "retired");
  assert.equal(catalog.demandHypotheses[0].retiredOn, "2026-09-03");
  assert.match(catalog.demandHypotheses[0].retireReason, /zero imports/);
});
