// Minimal Google service-account OAuth2 client (JWT bearer flow), hand-rolled instead of
// pulling in the `googleapis` SDK for two read-only endpoints. Matches the raw-fetch style
// already used in product-pipeline/shopify-sync.mjs.
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function loadServiceAccount(keyPath) {
  const raw = readFileSync(keyPath, "utf8");
  const { client_email, private_key } = JSON.parse(raw);
  if (!client_email || !private_key) {
    throw new Error(`Service account key at ${keyPath} is missing client_email/private_key`);
  }
  return { client_email, private_key };
}

export async function getAccessToken(keyPath, scope) {
  const { client_email, private_key } = loadServiceAccount(keyPath);
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = { iss: client_email, scope, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signature = base64url(createSign("RSA-SHA256").update(unsigned).sign(private_key));
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Google OAuth token request failed: ${res.status} ${JSON.stringify(json)}`);
  return json.access_token;
}
