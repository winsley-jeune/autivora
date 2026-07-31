// Shopify Admin API token via the OAuth client credentials grant — this store's app platform
// (Dev Dashboard, not the legacy "custom app" flow) only issues short-lived (24h) tokens this
// way, so unlike a classic static Admin API token, this fetches a fresh one on every run.
// https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/api-access-tokens/client-credentials

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
