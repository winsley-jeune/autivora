/**
 * One-time migration: seeds Sanity with vehicle data from lib/mock-db.ts
 *
 * ⚠️  HUMAN INTERVENTION REQUIRED before running:
 *   1. Ensure NEXT_PUBLIC_SANITY_PROJECT_ID is set in your .env file
 *   2. Ensure SANITY_API_TOKEN is set (needs write permission)
 *   3. Run with: npx ts-node -e "require('dotenv').config(); require('./scripts/seed-sanity.ts')"
 *      Or: npx tsx scripts/seed-sanity.ts  (if tsx is available)
 *
 * Safe to run multiple times — uses upsert by slug to avoid duplicates.
 */

import { createClient } from '@sanity/client';
import { LUXURY_BRANDS } from '../lib/mock-db';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const apiToken = process.env.SANITY_API_TOKEN;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

if (!projectId || !apiToken) {
  console.error('❌  Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: apiToken,
});

async function seedVehicles() {
  let created = 0;
  let skipped = 0;

  for (const [brandSlug, models] of Object.entries(LUXURY_BRANDS)) {
    for (const [modelSlug, data] of Object.entries(models)) {
      const slugCurrent = `${brandSlug}/${modelSlug}`;

      // Check if already exists
      const existing = await client.fetch(
        `*[_type == "vehicle" && slug.current == $slug][0]._id`,
        { slug: slugCurrent }
      );

      if (existing) {
        console.log(`  ↩  Skipping ${data.make} ${data.model} (already exists)`);
        skipped++;
        continue;
      }

      const doc = {
        _type: 'vehicle',
        make: data.make,
        model: data.model,
        year: data.year,
        interior_type: data.interior_type,
        scent_pairing: data.scent_pairing,
        description: data.description,
        slug: { _type: 'slug', current: slugCurrent },
      };

      await client.create(doc);
      console.log(`  ✅  Created: ${data.make} ${data.model}`);
      created++;
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

seedVehicles().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
