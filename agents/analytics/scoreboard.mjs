#!/usr/bin/env node
// The operator's daily scoreboard — the last step of the daily loop. One purpose: the
// operator wants to see SALES every day without asking. Pulls live orders straight from
// Shopify (not the snapshot — this line must never be stale), frames them against the North
// Star (10 sales/day), and delivers via macOS notification + a one-line log the operator can
// read in three seconds. Deterministic end to end — no model call.
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { initShopify, shopifyApi } from "../lib/shopify.mjs";
import { attributionChannel } from "./shopify.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const today = () => new Date().toISOString().slice(0, 10);

function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function main() {
  await initShopify();
  // Live paid orders: today (since local midnight) and trailing 7 days for the trend line.
  const { orders } = await shopifyApi("GET", `orders.json?status=any&financial_status=paid&created_at_min=${encodeURIComponent(isoDaysAgo(7))}&limit=250&fields=id,created_at,total_price,line_items,landing_site,referring_site,source_name`);
  const cutToday = isoDaysAgo(0);
  const todays = orders.filter((o) => o.created_at >= cutToday);
  const todayRevenue = todays.reduce((s, o) => s + Number(o.total_price), 0);
  const weekRevenue = orders.reduce((s, o) => s + Number(o.total_price), 0);
  const organicToday = todays.filter((order) => attributionChannel(order) === "organic_search");
  const organicRevenueToday = organicToday.reduce((sum, order) => sum + Number(order.total_price), 0);

  const items = todays.flatMap((o) => o.line_items.map((li) => li.title)).slice(0, 3);
  const northStar = 10;
  const headline = todays.length
    ? `${todays.length} sale(s) today — $${todayRevenue.toFixed(2)}${items.length ? ` (${items.join("; ").slice(0, 80)})` : ""}`
    : `0 sales today`;
  const line = `[scoreboard ${today()}] ${headline} | organic: ${organicToday.length} / $${organicRevenueToday.toFixed(2)} | 7d: ${orders.length} orders / $${weekRevenue.toFixed(2)} | North Star ${todays.length}/${northStar}`;

  console.log(line);
  mkdirSync(join(__dir, "output"), { recursive: true });
  writeFileSync(join(__dir, "output", "scoreboard-latest.txt"), line + "\n");

  // macOS notification — the operator sees the number without opening anything. Never let
  // notification failure (permissions, headless run) fail the loop.
  try {
    execFileSync("osascript", ["-e",
      `display notification ${JSON.stringify(`${headline} | 7d $${weekRevenue.toFixed(2)}`)} with title "Autivara — daily sales" sound name ${JSON.stringify(todays.length ? "Glass" : "")}`,
    ]);
  } catch {}
}

main().catch((e) => {
  console.error(`scoreboard failed: ${e.message}`);
  process.exit(1);
});
