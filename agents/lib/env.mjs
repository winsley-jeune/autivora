// Reads specific keys from the repo's .env file. readEnv() throws if any requested key is
// missing, so scripts fail fast with an actionable message instead of a confusing API 401
// later. readOptionalEnv() is the same parse without the presence check, for knobs that are
// legitimately blank most of the time (e.g. a test-customer exclude list).
//
// The single env reader for every agent — lives in agents/lib/ so no agent has to reach into
// a peer agent's directory for it.
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function parseEnvFile(keys) {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return {};
  const raw = readFileSync(envPath, "utf8");
  const values = {};
  for (const line of raw.split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    if (!keys.includes(k)) continue;
    values[k] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return values;
}

export function readEnv(keys) {
  const values = parseEnvFile(keys);
  const missing = keys.filter((k) => !values[k]);
  if (missing.length) {
    throw new Error(`Missing required .env keys: ${missing.join(", ")}. See .env.example.`);
  }
  return values;
}

export function readOptionalEnv(keys) {
  return parseEnvFile(keys);
}
