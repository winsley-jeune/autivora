import { createClient } from '@sanity/client';

const rawProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const projectId =
  rawProjectId && !rawProjectId.startsWith("your-") ? rawProjectId : undefined;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

// Export for use in server components and server actions
export const sanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      useCdn: true, // Cached CDN reads for production
    })
  : null;

// Write client (requires SANITY_API_TOKEN) — used only in migration scripts
export const sanityWriteClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      useCdn: false,
      token: process.env.SANITY_API_TOKEN,
    })
  : null;

export type SanityVehicle = {
  _id: string;
  make: string;
  model: string;
  year?: string;
  interior_type?: string;
  scent_pairing?: string;
  description?: string;
  slug?: { current: string };
  hero_image?: { asset: { url: string }; hotspot?: object };
};

// Returns all vehicles grouped by brand slug for the fitment index page
export async function getAllVehicles(): Promise<SanityVehicle[]> {
  if (!sanityClient) return [];
  return sanityClient.fetch<SanityVehicle[]>(
    `*[_type == "vehicle"] | order(make asc, model asc) {
      _id, make, model, year, interior_type, scent_pairing, description,
      slug, "hero_image": hero_image { ..., "asset": asset-> }
    }`,
    {},
    { next: { revalidate: 3600 } } // Revalidate every hour
  );
}

// Returns a single vehicle by brand + model slug
export async function getVehicleBySlug(
  brand: string,
  model: string
): Promise<SanityVehicle | null> {
  if (!sanityClient) return null;
  const slugCurrent = `${brand}/${model}`;
  const result = await sanityClient.fetch<SanityVehicle | null>(
    `*[_type == "vehicle" && slug.current == $slug][0] {
      _id, make, model, year, interior_type, scent_pairing, description,
      slug, "hero_image": hero_image { ..., "asset": asset-> }
    }`,
    { slug: slugCurrent },
    { next: { revalidate: 3600 } }
  );
  return result ?? null;
}
