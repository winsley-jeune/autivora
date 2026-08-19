import test from "node:test";
import assert from "node:assert/strict";
import { fetchSearchAnalytics } from "../analytics/search-console.mjs";
import { runCompleteReport } from "../analytics/ga4.mjs";

test("Search Console fetches every page and reports completeness", async () => {
  const originalFetch = globalThis.fetch;
  const starts = [];
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    starts.push(body.startRow);
    const rows = body.startRow === 0 ? [{ keys: ["a"] }, { keys: ["b"] }] : [{ keys: ["c"] }];
    return { ok: true, status: 200, json: async () => ({ rows }) };
  };
  try {
    const result = await fetchSearchAnalytics("https://example.com", "token", ["query"], { pageSize: 2, maxRows: 10 });
    assert.deepEqual(starts, [0, 2]);
    assert.equal(result.rows.length, 3);
    assert.equal(result.complete, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("GA4 fetches offsets until rowCount is satisfied", async () => {
  const originalFetch = globalThis.fetch;
  const offsets = [];
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    offsets.push(body.offset);
    const rows = body.offset === 0
      ? [{ dimensionValues: [{ value: "a" }], metricValues: [{ value: "1" }] }, { dimensionValues: [{ value: "b" }], metricValues: [{ value: "2" }] }]
      : [{ dimensionValues: [{ value: "c" }], metricValues: [{ value: "3" }] }];
    return {
      ok: true,
      status: 200,
      json: async () => ({ rowCount: 3, dimensionHeaders: [{ name: "page" }], metricHeaders: [{ name: "sessions" }], rows }),
    };
  };
  try {
    const result = await runCompleteReport("123", "token", { dateRanges: [] }, { pageSize: 2, maxRows: 10 });
    assert.deepEqual(offsets, [0, 2]);
    assert.equal(result.report.rows.length, 3);
    assert.equal(result.complete, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
