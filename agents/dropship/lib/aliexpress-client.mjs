// AliExpress Open Platform (DS API) client — implements the IOP/OP request-signing protocol.
// No official Node SDK exists (Java/.NET/PHP/Python/Ruby only), so this is a from-scratch port
// verified against the platform's own docs plus the community iop-style SDKs. Two API styles:
//   - legacy "TOP" methods (dotted names like aliexpress.ds.product.get) -> POST /sync, method
//     passed as a query/body param, sign = HMAC(sorted params) with no path prefix.
//   - newer "OP" methods (path names like /auth/token/create) -> POST /rest<path>, sign =
//     HMAC(path + sorted params).
// Both use sign_method=sha256, uppercase hex digest.
import { createHmac } from "node:crypto";

const TOP_API_URL = "https://api-sg.aliexpress.com/sync";
const OP_API_URL = "https://api-sg.aliexpress.com/rest";

function sign(params, appSecret) {
  const isPathStyle = typeof params.method === "string" && params.method.includes("/");
  const p = { ...params };
  let basestring = "";
  if (isPathStyle) {
    // Path-style: the path itself prefixes the basestring and is dropped from the param set
    // (it's already encoded in the request URL, not passed as a "method" param).
    basestring = p.method;
    delete p.method;
  }
  // Dotted-style: "method" has no path to live in, so it stays as a normal signed+sent param.

  basestring += Object.entries(p)
    .filter(([, value]) => value != null)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [key, value]) => acc + key + String(value), "");

  return createHmac("sha256", appSecret).update(basestring, "utf-8").digest("hex").toUpperCase();
}

function assembleUrl(params) {
  const isPathStyle = params.method.includes("/");
  const baseUrl = isPathStyle ? `${OP_API_URL}${params.method}` : TOP_API_URL;
  const p = { ...params };
  if (isPathStyle) delete p.method;

  const query = Object.entries(p)
    .filter(([, value]) => value != null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");

  return `${baseUrl}?${query}`;
}

// method: dotted TOP name ("aliexpress.ds.product.get") or path-style OP name ("/auth/token/create").
// session: access_token for authenticated business calls; omit for token create/refresh.
function topTimestamp() {
  // Legacy TOP gateway wants "yyyy-MM-dd HH:mm:ss" (classic Alibaba TOP protocol), not epoch ms.
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export async function callAliExpressApi({ method, params = {}, appKey, appSecret, session }) {
  const isPathStyle = method.includes("/");
  const fullParams = {
    ...params,
    method,
    app_key: appKey,
    sign_method: "sha256",
    simplify: true,
    timestamp: isPathStyle ? Date.now() : topTimestamp(),
    ...(session ? { session } : {}),
    // The legacy TOP gateway (dotted method names, POST /sync) requires these two system
    // params for signature validation; the newer OP gateway (path-style, POST /rest<path>)
    // rejects them as unrecognized, so only send them on the dotted-style route.
    ...(isPathStyle ? {} : { format: "json", v: "2.0" }),
  };
  fullParams.sign = sign(fullParams, appSecret);

  const res = await fetch(assembleUrl(fullParams), { method: "POST" });
  const json = await res.json();
  if (!res.ok || json.error_response) {
    throw new Error(`AliExpress API ${method} failed: ${JSON.stringify(json.error_response ?? json)}`);
  }
  return json;
}
