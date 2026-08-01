// The market-price oracle — makes the strict 7x law MECHANICAL instead of a judgment call.
// Each band records what a category actually sells for in the US; maxLanded = usTypical / 7 is
// derived, never stored, so a band update automatically moves the sourcing cap. Candidates whose
// supply price exceeds their band's maxLanded are dropped BEFORE the expensive verify stage.
//
// anchor: "strong"  -> the US band is real and visible to buyers; the cap is a hard gate.
// anchor: "weak"    -> adjacent-category pricing only; no hard cap (the model runs the
//                      would-a-USA-buyer-pay-this test instead), but the band still informs it.
//
// Bands are seeded from the 2026-07-30/31 competitive research (Aroma360/Hotel Collection,
// Pura/Drift, Case Elegance/Mantello, Amazon clone shelves). Scout may propose usTypical
// updates from its market knowledge (source: "model"), and the future Amazon API integration
// upgrades them to measured data (source: "amazon-api").
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const STATE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "state");
const BANDS_PATH = join(STATE_DIR, "market-bands.json");

const SEED = {
  "essential-fragrance-oils": {
    match: "essential oil|fragrance oil|perfume oil|aroma oil|reed diffuser oil",
    usTypical: 12, anchor: "strong",
    note: "Amazon oil shelf $5-15; effectively bans raw oils (maxLanded ~$1.70) — correct per doctrine",
  },
  "novelty-home-diffuser": {
    match: "flame|volcano|jellyfish|fireplace|ultrasonic|wood grain|humidifier diffuser|mist diffuser|night light diffuser",
    usTypical: 27, anchor: "strong",
    note: "Amazon clone shelf $18-35 for flame/jellyfish/ultrasonic forms",
  },
  "car-scent": {
    match: "car (air freshener|freshener|diffuser|perfume|aroma|fragrance)|vent clip|car vent",
    usTypical: 30, anchor: "strong",
    note: "Drift $17-23, Pura $35-50, Amazon accessories $8-30",
  },
  "wall-plug-diffuser": {
    match: "wall plug|plug[- ]?in.*diffuser",
    usTypical: 120, anchor: "strong",
    note: "AromaTech AroMini-class $100-300",
  },
  "smart-home-diffuser": {
    match: "(smart|wifi|bluetooth|app).*(diffuser|scent)|scent air machine",
    usTypical: 150, anchor: "strong",
    note: "Branded smart home diffusers $50-300 (Pura home, Aroma360 Mini Pro $99.95)",
  },
  "commercial-hvac-scent": {
    match: "hvac|commercial|hotel|spa|lobby|mall|m³|10000m|9000m|4000m|3000m|1500m|scent machine",
    usTypical: 500, anchor: "strong",
    note: "Aroma360/Hotel Collection commercial units $300-1,000 branded",
  },
  "desktop-humidor": {
    match: "humidor",
    usTypical: 120, anchor: "strong",
    note: "Mantello $60-90, Case Elegance $100-160, premium $220",
  },
  "aromatic-wood-objects": {
    match: "cedar|sandalwood|incense (box|cabinet|burner)|keepsake box|tea caddy|valet box",
    usTypical: 90, anchor: "weak",
    note: "Adjacent gift-object pricing; weak anchors — willingness-to-pay territory",
  },
};

export function loadBands() {
  if (!existsSync(BANDS_PATH)) {
    mkdirSync(STATE_DIR, { recursive: true });
    const seeded = {};
    for (const [k, v] of Object.entries(SEED)) seeded[k] = { ...v, source: "session-research-2026-07", updatedOn: "2026-08-01" };
    writeFileSync(BANDS_PATH, JSON.stringify(seeded, null, 2));
  }
  return JSON.parse(readFileSync(BANDS_PATH, "utf8"));
}

export function saveBands(bands) {
  writeFileSync(BANDS_PATH, JSON.stringify(bands, null, 2));
}

export function maxLandedOf(band) {
  return band.anchor === "strong" ? Math.round((band.usTypical / 7) * 100) / 100 : null;
}

// First strong-anchor band wins (order matters: oils before generic diffuser terms); falls back
// to a weak band; null = unknown category (treated as anchor-free, model judges).
export function matchBand(bands, title) {
  let weak = null;
  for (const [key, band] of Object.entries(bands)) {
    if (!new RegExp(band.match, "i").test(title)) continue;
    if (band.anchor === "strong") return { key, ...band, maxLanded: maxLandedOf(band) };
    weak ??= { key, ...band, maxLanded: null };
  }
  return weak;
}
