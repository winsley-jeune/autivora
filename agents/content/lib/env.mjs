// Reads specific keys from the repo's .env file. Throws if any requested key is missing,
// so scripts fail fast with an actionable message instead of a confusing API 401 later.
// Duplicated (not imported) from agents/analytics/lib/env.mjs on purpose — each agent area
// stays independent, matching the modular design of this repo's agent tooling.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

export function readEnv(keys) {
  const raw = readFileSync(join(ROOT, ".env"), "utf8");
  const values = {};
  for (const line of raw.split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    if (!keys.includes(k)) continue;
    values[k] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  const missing = keys.filter((k) => !values[k]);
  if (missing.length) {
    throw new Error(`Missing required .env keys: ${missing.join(", ")}. See agents/content/README.md.`);
  }
  return values;
}
