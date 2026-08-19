// Canonical storefront category registry. These are code-native routes backed by Shopify tags,
// not Shopify Collection objects; agents must optimize the surfaces customers and Google see.
import { openDb } from "./db.mjs";

export const COMMERCIAL_SURFACES = [
  { key: "all", path: "/collection", ownerType: "category", tags: [] },
  { key: "auto", path: "/auto", ownerType: "category", tags: ["car-diffusers", "car", "auto"] },
  { key: "home", path: "/home", ownerType: "category", tags: ["home-diffusers", "home"] },
  { key: "scents", path: "/scents", ownerType: "category", tags: ["fragrance-oil", "fragrance-oils", "refill"] },
  { key: "industrial", path: "/industrial", ownerType: "category", tags: ["industrial-scenting", "commercial-industrial", "business"] },
];

function matches(product, surface) {
  if (!surface.tags.length) return product.status === "active";
  const tags = new Set(product.tags.map((tag) => tag.toLowerCase()));
  return product.status === "active" && surface.tags.some((tag) => tags.has(tag));
}

export function deriveCommercialSurfaces(snapshot, searchConsole = null, indexCoverage = null) {
  if (!snapshot?.complete) throw new Error("Commercial surfaces require a complete Shopify catalog");
  return COMMERCIAL_SURFACES.map((surface) => {
    const products = snapshot.products.filter((p) => matches(p, surface));
    const page = searchConsole?.pages?.find((row) => {
      try { return new URL(row.keys[0]).pathname === surface.path; } catch { return false; }
    });
    const index = indexCoverage?.results?.find((row) => {
      try { return new URL(row.url).pathname === surface.path; } catch { return false; }
    });
    return {
      ...surface, productIds: products.map((p) => p.id), productCount: products.length,
      empty: products.length === 0, impressions: page?.impressions ?? 0, clicks: page?.clicks ?? 0,
      position: page?.position ?? null, indexState: index?.coverageState ?? "UNKNOWN",
      observedAt: snapshot.observedAt,
    };
  });
}

let ready = false;
function ensure() {
  const d = openDb();
  if (ready) return d;
  d.exec(`CREATE TABLE IF NOT EXISTS commercial_surfaces (
    surface_key TEXT PRIMARY KEY, path TEXT NOT NULL UNIQUE, owner_type TEXT NOT NULL,
    observed_at TEXT NOT NULL, state TEXT NOT NULL
  ) WITHOUT ROWID;`);
  ready = true;
  return d;
}

export function recordCommercialSurfaces(surfaces) {
  const stmt = ensure().prepare(`INSERT INTO commercial_surfaces(surface_key,path,owner_type,observed_at,state)
    VALUES(?,?,?,?,?) ON CONFLICT(surface_key) DO UPDATE SET path=excluded.path,owner_type=excluded.owner_type,observed_at=excluded.observed_at,state=excluded.state`);
  for (const surface of surfaces) stmt.run(surface.key, surface.path, surface.ownerType, surface.observedAt, JSON.stringify(surface));
  return surfaces;
}

export function listCommercialSurfaces() {
  return ensure().prepare("SELECT state FROM commercial_surfaces ORDER BY surface_key").all().map((row) => JSON.parse(row.state));
}
