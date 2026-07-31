// AliExpress OAuth for the Scout agent. Canonical token lives in state/aliexpress-token.json.
//
// Token lifetimes are the critical operational constraint while the app is in "Test" status:
// access_token 24h, refresh_token 48h. The daily 7am run refreshes unconditionally, so each
// run renews the 48h refresh window — but if the job misses ~2 consecutive days, the refresh
// token dies and a human must redo the browser consent flow once. getFreshSession() fails LOUD
// with the exact re-auth URL for that case ("Apply Online" in the App Console lifts this to
// 30/60 days).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { callAliExpressApi } from "./aliexpress-client.mjs";

const STATE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "state");
const TOKEN_PATH = join(STATE_DIR, "aliexpress-token.json");
const REFRESH_MARGIN_MS = 6 * 3600 * 1000; // refresh whenever less than 6h of access life remains

export function getAuthorizeUrl({ appKey, redirectUri }) {
  const params = new URLSearchParams({
    response_type: "code",
    force_auth: "true",
    redirect_uri: redirectUri,
    client_id: appKey,
  });
  return `https://api-sg.aliexpress.com/oauth/authorize?${params}`;
}

function save(tokenResponse) {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(TOKEN_PATH, JSON.stringify(tokenResponse, null, 2));
}

export function loadToken() {
  if (!existsSync(TOKEN_PATH)) return null;
  return JSON.parse(readFileSync(TOKEN_PATH, "utf8"));
}

export async function createTokenFromCode({ appKey, appSecret, code }) {
  const json = await callAliExpressApi({ method: "/auth/token/create", params: { code }, appKey, appSecret });
  save(json);
  return json;
}

// Returns a valid access_token, refreshing if needed. Throws with re-auth instructions when the
// refresh token itself is dead — the one situation that genuinely needs a human.
export async function getFreshSession({ appKey, appSecret, redirectUri = "https://autivara.com/api/aliexpress/callback" }) {
  const cached = loadToken();
  const reAuthMsg = `AliExpress re-authorization required (refresh token expired or missing). Open this URL, log in as the store's buyer account, click Authorize, then run: node agents/dropship/scripts/exchange-code.mjs <code>\n${getAuthorizeUrl({ appKey, redirectUri })}`;
  if (!cached) throw new Error(reAuthMsg);

  const accessAliveMs = (cached.expire_time ?? 0) - Date.now();
  if (accessAliveMs > REFRESH_MARGIN_MS) return cached.access_token;

  const refreshAlive = (cached.refresh_token_valid_time ?? 0) > Date.now();
  if (!refreshAlive) throw new Error(reAuthMsg);

  const json = await callAliExpressApi({
    method: "/auth/token/refresh",
    params: { refresh_token: cached.refresh_token },
    appKey,
    appSecret,
  });
  save(json);
  return json.access_token;
}
