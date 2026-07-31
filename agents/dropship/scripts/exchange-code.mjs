#!/usr/bin/env node
// Auth bootstrap — the ONE flow that needs a human (browser consent). Used on first setup and
// whenever the refresh token dies (Test-status apps: refresh lives 48h; missing ~2 daily runs
// kills it and Scout's run.mjs prints the authorize URL to redo this).
// Run: node agents/dropship/scripts/exchange-code.mjs <code-from-callback-url>
import { readEnv } from "../../analytics/lib/env.mjs";
import { createTokenFromCode } from "../lib/aliexpress-auth.mjs";

const code = process.argv[2];
if (!code) {
  console.error("Usage: node exchange-code.mjs <code>");
  process.exit(1);
}

const { ALIEXPRESS_APP_KEY: appKey, ALIEXPRESS_APP_SECRET: appSecret } = readEnv([
  "ALIEXPRESS_APP_KEY",
  "ALIEXPRESS_APP_SECRET",
]);

const result = await createTokenFromCode({ appKey, appSecret, code });
console.log(`Token saved to agents/dropship/state/aliexpress-token.json (account: ${result.account}, expires: ${new Date(result.expire_time).toISOString()})`);
