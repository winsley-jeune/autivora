// The single Shopify Admin API client for every agent. This store's app platform (Dev
// Dashboard, not the legacy "custom app" flow) only issues short-lived (24h) tokens via the
// OAuth client-credentials grant — there is no static admin token, so every process fetches a
// fresh token at init. https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/api-access-tokens/client-credentials
import { readEnv } from "./env.mjs";

export const SHOPIFY_API_VERSION = "2024-10";

let token = null;
let domain = null;

export async function getShopifyAdminToken(shopDomain, clientId, clientSecret) {
  const res = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Shopify OAuth token request failed: ${res.status} ${JSON.stringify(json)}`);
  return json.access_token;
}

export async function initShopify() {
  if (token) return;
  const env = readEnv(["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_CLIENT_ID", "SHOPIFY_ADMIN_CLIENT_SECRET"]);
  domain = env.SHOPIFY_STORE_DOMAIN;
  token = await getShopifyAdminToken(domain, env.SHOPIFY_ADMIN_CLIENT_ID, env.SHOPIFY_ADMIN_CLIENT_SECRET);
}

export async function shopifyApi(method, path, body) {
  if (!token) throw new Error("shopifyApi called before initShopify()");
  const res = await fetch(`https://${domain}/admin/api/${SHOPIFY_API_VERSION}/${path}`, {
    method,
    headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { _raw: text }; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  // Cursor pagination: callers that need the next page read res.headers via _linkNext.
  const link = res.headers.get("link") || "";
  const next = link.match(/<[^>]*[?&]page_info=([^>&]+)[^>]*>;\s*rel="next"/);
  if (next) Object.defineProperty(json, "_linkNext", { value: next[1], enumerable: false });
  return json;
}
