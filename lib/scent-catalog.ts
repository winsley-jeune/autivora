/**
 * Unified scent catalog — shared across auto, home, office, industrial categories.
 * Each scent's `productId` maps to a Shopify product; live price/image fetched at render.
 */

import { SIGNATURE_OILS, type UpsellOil } from './upsell-products';

export type ScentEntry = UpsellOil & {
  metaTitle: string;
  metaDescription: string;
  longDescription: string;
  bestFor: {
    auto: string;
    home: string;
    office: string;
    industrial: string;
  };
};

// Reuse the upsell SIGNATURE_OILS as the master list, enriched with cross-category copy.
export const SCENTS: ScentEntry[] = SIGNATURE_OILS.map((oil) => {
  const enrichment: Record<string, Pick<ScentEntry, 'metaTitle' | 'metaDescription' | 'longDescription' | 'bestFor'>> = {
    savage: {
      metaTitle: 'Savage — Warm, Woody, Sensual Scent | Autivora',
      metaDescription:
        'Rich resinous notes designed to complement leather and dark-wood interiors. Available as a refill or subscription for any Autivora diffuser.',
      longDescription:
        'A composition built around warm wood and resinous depth. Top notes settle within minutes into a long-lingering base of leather, amber, and dark spice — ideal for spaces that benefit from a sense of weight and presence.',
      bestFor: {
        auto: 'Leather and Alcantara interiors — pairs naturally with dark cabin materials in Porsche, Bentley, and Rolls-Royce cabins.',
        home: 'Entryway and living room. The statement scent of a thoughtfully designed home.',
        office: 'Private executive offices. Conveys gravity without overstatement.',
        industrial: 'Luxury retail boutiques and fine dining entrances. Defines a premium first impression.',
      },
    },
    compassion: {
      metaTitle: 'Compassion — Fresh, Citrus, Opulent Scent | Autivora',
      metaDescription:
        'Crisp citrus and green notes designed for refined, balanced ambient scenting. Works across every Autivora category.',
      longDescription:
        'A bright, multi-faceted composition that opens with sharp citrus and resolves into a clean green-floral base. Works across more contexts than any other scent in the catalog — auto, home, office, hospitality — without ever feeling dated.',
      bestFor: {
        auto: 'Daily-drive cabins where you want energy without aggression. Excellent for spring and summer use.',
        home: 'Kitchen, living room, and bathroom. The versatile workhorse of the catalog.',
        office: 'Open-plan and meeting rooms. Universally well-received, low controversy.',
        industrial: 'Spa and yoga studio reception. Pairs with wellness positioning.',
      },
    },
    'vanilla-macadamia': {
      metaTitle: 'Vanilla Macadamia — Soft, Sweet, Enveloping Scent | Autivora',
      metaDescription:
        'Warm vanilla layered with rich macadamia. The gourmand-leaning option in the Autivora catalog.',
      longDescription:
        'A soft, comforting blend that pairs warm vanilla with rich macadamia nut. Reads as familiar and welcoming without ever tipping into dessert-like sweetness — engineered for environments where comfort is the goal.',
      bestFor: {
        auto: 'Long-drive comfort. Particularly suited to colder months and family vehicles.',
        home: 'Bedroom, nursery, and bathroom. The atmosphere of home itself.',
        office: 'Reception areas and team lounges. Reduces visitor anxiety.',
        industrial: 'Real estate staging and dental waiting rooms. Measured to reduce stress and lengthen dwell time.',
      },
    },
  };

  const e = enrichment[oil.id] ?? {
    metaTitle: `${oil.id} | Autivora`,
    metaDescription: oil.description,
    longDescription: oil.description,
    bestFor: { auto: oil.description, home: oil.description, office: oil.description, industrial: oil.description },
  };

  return { ...oil, ...e };
});

export function getScent(slug: string): ScentEntry | undefined {
  return SCENTS.find((s) => s.id === slug);
}
