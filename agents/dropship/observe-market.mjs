#!/usr/bin/env node
// Daily market observation pass — harvests order-count snapshots across a fixed keyword
// panel into the observatory (lib/observatory.mjs). Runs in the daily loop BEFORE Scout so
// each sourcing run reasons over fresh velocity data. Read-only against AliExpress; writes
// only to local state. Velocity needs ≥2 days of snapshots, so this earns its keep silently
// for the first day and compounds every day after.
//
// The panel (agents.db, dropship_keyword_panel) is a WIDE consumer-category net, deliberately
// broader than Scout's sourcing queues: the observatory's job is seeing demand move anywhere
// in the space Autivara could credibly play, not just where we already source. Operator-
// editable (sqlite3 agents/state/agents.db); Scout's demand researcher may also propose panel
// additions over time.
//
// Usage: node agents/dropship/observe-market.mjs
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readEnv } from "../lib/env.mjs";
import { openDb, importLegacyJson } from "../lib/db.mjs";
import { getFreshSession } from "./lib/aliexpress-auth.mjs";
import { searchKeyword } from "./lib/market.mjs";
import { recordSnapshots, observatoryStats, demandMovers } from "./lib/observatory.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const LEGACY_PANEL_PATH = join(__dir, "state", "keyword-panel.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = () => new Date().toISOString().slice(0, 10);

// Seed panel: wide consumer-gift/scent/ritual territory. ~1-2s per keyword per day.
const DEFAULT_PANEL = [
  // car
  { keyword: "car aromatherapy diffuser", tier: "value-china" },
  { keyword: "car air freshener cute", tier: "value-china" },
  { keyword: "car vent clip perfume", tier: "value-china" },
  { keyword: "car diffuser rechargeable", tier: "value-china" },
  // home scent & ritual
  { keyword: "flame aroma diffuser", tier: "value-china" },
  { keyword: "jellyfish diffuser", tier: "value-china" },
  { keyword: "backflow incense burner ceramic", tier: "value-china" },
  { keyword: "incense holder wood", tier: "value-china" },
  { keyword: "reed diffuser ceramic", tier: "value-china" },
  { keyword: "candle warmer lamp", tier: "value-china" },
  { keyword: "wax melt burner electric", tier: "value-china" },
  { keyword: "aroma stone diffuser plaster", tier: "value-china" },
  { keyword: "smart aroma diffuser wifi", tier: "value-china" },
  // wood / gift objects
  { keyword: "wooden gift box engraved", tier: "value-china" },
  { keyword: "walnut desk organizer", tier: "value-china" },
  { keyword: "wood valet tray men", tier: "value-china" },
  { keyword: "whiskey stones gift set", tier: "value-china" },
  { keyword: "cocktail smoker kit wood", tier: "value-china" },
  { keyword: "groomsmen gift wood", tier: "value-china" },
  { keyword: "keepsake box wooden", tier: "value-china" },
  { keyword: "jewelry box wood men", tier: "value-china" },
  { keyword: "cedar hanger blocks", tier: "value-china" },
  // desk / ambience adjacent
  { keyword: "desk lamp ambient wood", tier: "value-china" },
  { keyword: "zen garden desk kit", tier: "value-china" },
  { keyword: "desktop water fountain zen", tier: "value-china" },
  { keyword: "salt lamp himalayan usb", tier: "value-china" },
  { keyword: "essential oil gift set", tier: "value-china" },
  { keyword: "car interior accessories luxury", tier: "value-china" },
  // commercial
  { keyword: "scent machine hotel", tier: "value-china" },
  { keyword: "waterless diffuser nebulizer", tier: "value-china" },
];

function loadPanel() {
  const d = openDb();
  d.exec(`
    CREATE TABLE IF NOT EXISTS dropship_keyword_panel (
      keyword TEXT PRIMARY KEY,
      tier    TEXT NOT NULL
    ) WITHOUT ROWID;
  `);
  const ins = d.prepare("INSERT OR REPLACE INTO dropship_keyword_panel (keyword, tier) VALUES (?, ?)");
  importLegacyJson("migrated.dropship_keyword_panel", LEGACY_PANEL_PATH, (parsed) => {
    for (const e of parsed) ins.run(e.keyword, e.tier);
  });
  if (d.prepare("SELECT COUNT(*) n FROM dropship_keyword_panel").get().n === 0) {
    for (const e of DEFAULT_PANEL) ins.run(e.keyword, e.tier);
  }
  return d.prepare("SELECT keyword, tier FROM dropship_keyword_panel ORDER BY keyword").all();
}

async function main() {
  const { ALIEXPRESS_APP_KEY, ALIEXPRESS_APP_SECRET } = readEnv(["ALIEXPRESS_APP_KEY", "ALIEXPRESS_APP_SECRET"]);
  const session = await getFreshSession({ appKey: ALIEXPRESS_APP_KEY, appSecret: ALIEXPRESS_APP_SECRET });
  const auth = { appKey: ALIEXPRESS_APP_KEY, appSecret: ALIEXPRESS_APP_SECRET, session };

  const panel = loadPanel();

  const day = today();
  let recorded = 0, failed = 0;
  for (const entry of panel) {
    try {
      const res = await searchKeyword({ keyword: entry.keyword, tier: entry.tier, auth });
      if (res.ok) {
        recorded += recordSnapshots(
          res.products.map((p) => ({ itemId: p.itemId, keyword: entry.keyword, tier: entry.tier, title: p.title, price: p.price, orders: p.orders ?? 0, rating: p.rating })),
          day,
        );
      } else failed++;
    } catch (e) {
      failed++;
      console.error(`observe: "${entry.keyword}" failed: ${e.message.slice(0, 100)}`);
    }
    await sleep(700);
  }

  const stats = observatoryStats();
  console.log(`Observatory: recorded ${recorded} snapshot(s) across ${panel.length - failed}/${panel.length} keyword(s) for ${day}.`);
  console.log(`Observatory: tracking ${stats.items} item(s) over ${stats.days} day(s) (${stats.rows} rows).`);

  const movers = demandMovers({ limit: 10 });
  if (movers.length) {
    console.log("\nTop demand movers (Δorders/day, low-base momentum first):");
    for (const m of movers) console.log(`  +${m.velocity}/day (base ${m.base_orders}) $${m.price} [${m.keyword}] ${String(m.title).slice(0, 70)}`);
  } else {
    console.log("Velocity needs ≥2 days of snapshots — movers appear from tomorrow's run.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
