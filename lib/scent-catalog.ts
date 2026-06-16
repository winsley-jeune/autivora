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
    'coastal-linen': {
      metaTitle: 'Coastal Linen — Sea Salt & Cotton Scent | Autivara',
      metaDescription:
        'Sea salt, white musk, and crisp cotton — clean ocean-air fragrance oil for waterless cold-air diffusion in car, home, and commercial spaces.',
      longDescription:
        'Sea salt and white musk over a base of sun-dried cotton — the scent of a beach house with every window open. Coastal Linen reads as clean before it reads as fragrance, which makes it the safest first bottle in the catalog.',
      bestFor: {
        auto: 'Daily drivers and family vehicles. Reads as a freshly detailed cabin, never as perfume.',
        home: 'Bedrooms and bathrooms. The just-laundered feeling, on tap.',
        office: 'Reception and shared spaces. Clean and entirely inoffensive.',
        industrial: 'Vacation rentals and gyms. Signals "freshly cleaned" the moment the door opens.',
      },
    },
    'white-tea-cedar': {
      metaTitle: 'White Tea & Cedar — Hotel-Lobby Scent | Autivara',
      metaDescription:
        'White tea, cedar, and light citrus — the polished hotel-lobby fragrance oil for cold-air diffusers in car, home, office, and commercial spaces.',
      longDescription:
        'Soft white tea lifted by light citrus and grounded in dry cedar. This is the genre of scent luxury hotels build their lobbies around — quiet, polished, and impossible to tire of. If you want one scent for every space you own, this is it.',
      bestFor: {
        auto: 'Executive cabins and rideshare. Universally welcome, zero controversy.',
        home: 'Entryway and living room. Makes the whole house read curated.',
        office: 'Client-facing spaces. The scent equivalent of a firm handshake.',
        industrial: 'Hotels, dental offices, and boutiques. The proven hospitality standard.',
      },
    },
    'cloud-cotton': {
      metaTitle: 'Cloud Cotton — Fresh Laundry Scent | Autivara',
      metaDescription:
        'Fresh cotton, soft aldehydes, and light musk — airy laundry-day fragrance oil for waterless diffusion in bedrooms, rentals, and family cars.',
      longDescription:
        'Fresh cotton brightened with sparkling aldehydes and settled into soft musk. Cloud Cotton is comfort distilled — the smell of clean sheets and warm towels, engineered to stay light instead of tipping into detergent sweetness.',
      bestFor: {
        auto: 'Family vehicles. The everything-is-under-control scent.',
        home: 'Bedrooms, nurseries, and laundry rooms. Domestic calm.',
        office: 'Wellness rooms and quiet spaces. Softens hard interiors.',
        industrial: 'Short-term rentals and waiting rooms. Reads as freshly turned over.',
      },
    },
    'pure-rain': {
      metaTitle: 'Pure Rain — After-the-Storm Fresh Scent | Autivara',
      metaDescription:
        'Ozone, petrichor, and green leaves — the crisp after-rain fragrance oil for cold-air diffusers. Cool, clean, and quietly green in any space.',
      longDescription:
        'Ozone and petrichor over crushed green leaves — the charged freshness of the first minutes after a storm. Pure Rain is the most atmospheric scent in the catalog: less a fragrance than a change in the weather.',
      bestFor: {
        auto: 'EVs and minimalist interiors. Crisp and modern, never sweet.',
        home: 'Home offices and sunrooms. Keeps the air feeling moving.',
        office: 'Focus areas. Freshness that reads as alertness.',
        industrial: 'Gyms and fitness studios. Clean energy without perfume.',
      },
    },
    'citrus-bloom': {
      metaTitle: 'Citrus Bloom — Bergamot & Neroli Scent | Autivara',
      metaDescription:
        'Bergamot, neroli, and grapefruit — bright citrus-floral fragrance oil for waterless cold-air diffusion. Energy without aggression, in any space.',
      longDescription:
        'Sharp bergamot and grapefruit opening into white neroli blossom. Citrus Bloom delivers brightness with manners — the lift of fresh citrus refined by a floral heart, so it energizes a space without ever shouting.',
      bestFor: {
        auto: 'Morning commutes and summer drives. The wake-up scent.',
        home: 'Kitchens and bathrooms. Cuts through cooking and damp air.',
        office: 'Open-plan floors and meeting rooms. Bright, low-controversy energy.',
        industrial: 'Restrooms and cafés. The universal freshness signal.',
      },
    },
    'amalfi-sun': {
      metaTitle: 'Amalfi Sun — Lemon & Sea Breeze Scent | Autivara',
      metaDescription:
        'Lemon, mandarin, and sea breeze — sun-drenched Mediterranean citrus fragrance oil for cold-air diffusion in cars, homes, and hospitality spaces.',
      longDescription:
        'Sun-warmed lemon and mandarin cooled by a salt-tinged breeze — the Amalfi coast in a bottle. Brighter and juicier than Citrus Bloom, this is summer as a deliberate choice, any month of the year.',
      bestFor: {
        auto: 'Convertibles and weekend cars. Holiday mode on demand.',
        home: 'Kitchens and dining spaces. Sunlight you can schedule.',
        office: 'Creative studios. Optimism as an ambient condition.',
        industrial: 'Restaurants, cafés, and resort lobbies. Vacation-grade first impressions.',
      },
    },
    'yuzu-verbena': {
      metaTitle: 'Yuzu Verbena — Zesty Citrus Mint Scent | Autivara',
      metaDescription:
        'Yuzu, verbena, and cool mint — the sharpest, most energizing fragrance oil in the Autivara line. Waterless cold-air diffusion for car and space.',
      longDescription:
        'Japanese yuzu and lemon verbena edged with cool mint — the most awake scent in the catalog. Yuzu Verbena is precision freshness: zesty, slightly green, and finished with a menthol coolness that keeps a space feeling sharp.',
      bestFor: {
        auto: 'Long drives and early starts. Alertness in scent form.',
        home: 'Home gyms and morning bathrooms. The cold-shower scent.',
        office: 'High-tempo teams. Keeps the afternoon from going flat.',
        industrial: 'Fitness studios and juice bars. Clean, energetic, modern.',
      },
    },
    'noir-oud': {
      metaTitle: 'Noir Oud — Oud, Amber & Leather Scent | Autivara',
      metaDescription:
        'Oud, amber, and leather — the deepest fragrance oil in the Autivara line. Premium cold-air diffusion for leather interiors and evening spaces.',
      longDescription:
        'Dark oud wrapped in amber and finished with worn leather. Noir Oud is the statement scent of the catalog — deep, resinous, and unapologetically luxurious. It does for a space what dim lighting does: everything in it becomes more interesting.',
      bestFor: {
        auto: 'Leather and Alcantara cabins. Built for dark interiors and night drives.',
        home: 'Living rooms and studies. The after-dark signature.',
        office: 'Private executive offices. Gravity without a word spoken.',
        industrial: 'Cocktail bars, cigar lounges, and luxury retail. Presence as a brand asset.',
      },
    },
    'cedar-sage': {
      metaTitle: 'Cedar & Sage — Grounded Woody Spa Scent | Autivara',
      metaDescription:
        'Cedarwood, sage, and vetiver — grounded, spa-calm fragrance oil for waterless cold-air diffusion in homes, studios, and treatment rooms.',
      longDescription:
        'Dry cedarwood lifted by herbal sage and rooted in earthy vetiver. Cedar & Sage is the scent of a high-end mountain spa — grounded, quietly masculine, and instantly calming without being sleepy.',
      bestFor: {
        auto: 'Trucks and SUVs. Outdoorsy without the pine-tree cliché.',
        home: 'Studies and dens. Cabin atmosphere, city address.',
        office: 'Therapy and consultation rooms. Settles the nerves.',
        industrial: 'Spas, yoga studios, and menswear retail. Grounded premium calm.',
      },
    },
    'smoked-vetiver': {
      metaTitle: 'Smoked Vetiver — Bold Smoky Wood Scent | Autivara',
      metaDescription:
        'Vetiver, smoke, and black pepper — bold, peppered fragrance oil for cold-air diffusion. Presence, not perfume, for cabins and commercial spaces.',
      longDescription:
        'Earthy vetiver drawn through smoke and cracked black pepper. Smoked Vetiver is the boldest scent in the line — angular, modern, and confident. Choose it when you want a space to have a point of view.',
      bestFor: {
        auto: 'Performance cars. The scent equivalent of an exhaust note.',
        home: 'Lofts and bachelor spaces. Architecture you can smell.',
        office: 'Design studios. Signals taste and intent.',
        industrial: 'Barbershops, whiskey bars, and concept stores. Unmistakable identity.',
      },
    },
    'santal-royale': {
      metaTitle: 'Santal Royale — Creamy Sandalwood Scent | Autivara',
      metaDescription:
        'Sandalwood, cardamom, and musk — creamy, quietly luxurious fragrance oil for waterless cold-air diffusion in cars, homes, and boutiques.',
      longDescription:
        'Creamy sandalwood warmed with cardamom and smoothed into soft musk. Santal Royale is quiet luxury rendered in scent — the fragrance family behind several cult luxury candles, delivered as a pure diffusion oil.',
      bestFor: {
        auto: 'Luxury sedans. Warmth that matches stitched leather.',
        home: 'Living rooms and primary suites. The good-hotel-robe feeling.',
        office: 'Partner offices and client lounges. Understated, expensive calm.',
        industrial: 'Jewelry boutiques and galleries. The scent of considered taste.',
      },
    },
    'amber-vanilla': {
      metaTitle: 'Amber Vanilla — Warm Vanilla Tonka Scent | Autivara',
      metaDescription:
        'Vanilla, amber, and tonka bean — warm, composed fragrance oil for cold-air diffusion. Comfort without the candy-shop sweetness.',
      longDescription:
        'True vanilla deepened with amber and tonka bean. Amber Vanilla is warmth with composure — sweet enough to comfort, structured enough to stay sophisticated. The catalog’s replacement for every cloying vanilla candle you’ve ever regretted.',
      bestFor: {
        auto: 'Winter commutes and family cars. Warmth on cold mornings.',
        home: 'Living rooms and bedrooms. The fireplace feeling, no fireplace.',
        office: 'Reception lounges. Eases the wait.',
        industrial: 'Real-estate staging and cafés. Domestic warmth at commercial scale.',
      },
    },
    'tobacco-caramel': {
      metaTitle: 'Tobacco Caramel — Sweet Smoke Scent | Autivara',
      metaDescription:
        'Tobacco leaf, caramel, and vanilla — the cocktail-bar signature fragrance oil for cold-air diffusion in lounges, dens, and statement cabins.',
      longDescription:
        'Cured tobacco leaf glazed with caramel and rounded by vanilla. Tobacco Caramel is the cocktail-bar signature — sweet smoke without the smoke, indulgent without being edible. The most complimented scent in the warm family.',
      bestFor: {
        auto: 'Evening drives and grand tourers. Old-money cabin atmosphere.',
        home: 'Dens, libraries, and home bars. The nightcap scent.',
        office: 'Lounge corners and after-hours spaces. Earned relaxation.',
        industrial: 'Cocktail bars, steakhouses, and speakeasies. A signature guests remember.',
      },
    },
    'cashmere-musk': {
      metaTitle: 'Cashmere Musk — Soft Warm Musk Scent | Autivara',
      metaDescription:
        'Warm musk, sandalwood, and vanilla — soft, skin-close fragrance oil for waterless cold-air diffusion. The scent equivalent of cashmere.',
      longDescription:
        'Warm musk folded into sandalwood and a whisper of vanilla. Cashmere Musk is the softest scent in the catalog — skin-close, enveloping, and almost tactile. It doesn’t announce itself; it makes a space feel finished.',
      bestFor: {
        auto: 'Quiet luxury cabins. Felt more than noticed.',
        home: 'Bedrooms and reading corners. Softness as an atmosphere.',
        office: 'Wellness rooms and quiet zones. Low-volume comfort.',
        industrial: 'Boutique hotels and bridal retail. Intimate, polished warmth.',
      },
    },
    'velvet-rose': {
      metaTitle: 'Velvet Rose — Modern Rose & Wood Scent | Autivara',
      metaDescription:
        'Rose, peony, and sandalwood — a modern rose fragrance oil, never powdery. Waterless cold-air diffusion for homes, boutiques, and salons.',
      longDescription:
        'Fresh-cut rose and peony set over smooth sandalwood. Velvet Rose is the rose for people who think they don’t like rose — petals without powder, romance without the dust.',
      bestFor: {
        auto: 'A romantic gesture of a cabin. Date-night spec.',
        home: 'Bedrooms and dressing rooms. Quiet romance, daily.',
        office: 'Beauty and fashion workplaces. On-brand by default.',
        industrial: 'Florists, salons, and bridal boutiques. The category scent, perfected.',
      },
    },
    'jasmine-noir': {
      metaTitle: 'Jasmine Noir — Night-Blooming Floral | Autivara',
      metaDescription:
        'Jasmine, tuberose, and amber — heady white florals after dark. A confident fragrance oil for cold-air diffusion in evening-first spaces.',
      longDescription:
        'Night-blooming jasmine and tuberose warmed with amber. Jasmine Noir is white florals after dark — heady, confident, and unapologetically sensual. The scent for spaces that come alive in the evening.',
      bestFor: {
        auto: 'Evening city drives. Glamour at cabin scale.',
        home: 'Dining rooms and entertaining spaces. Dinner-party atmosphere.',
        office: 'Showrooms and event spaces. Drama, controlled.',
        industrial: 'Hotel bars, spas, and evening venues. Memorable by design.',
      },
    },
    'peony-petal': {
      metaTitle: 'Peony Petal — Light Dewy Floral Scent | Autivara',
      metaDescription:
        'Peony, lychee, and soft musk — light, dewy floral fragrance oil for waterless cold-air diffusion. Effortlessly pretty in any daytime space.',
      longDescription:
        'Dewy peony brightened with lychee and softened into clean musk. Peony Petal is the lightest floral in the catalog — fresh-flowers-on-the-counter pretty, with none of the heaviness that makes florals divisive.',
      bestFor: {
        auto: 'Daily drivers. Pretty without perfume-cloud risk.',
        home: 'Kitchens, hallways, and guest rooms. Fresh-bouquet energy.',
        office: 'Front desks and shared spaces. Universally liked.',
        industrial: 'Nail salons, boutiques, and medspas. Soft, feminine polish.',
      },
    },
    'eucalyptus-mint': {
      metaTitle: 'Eucalyptus Mint — Cool Spa Clarity Scent | Autivara',
      metaDescription:
        'Eucalyptus, mint, and spearmint — the steam-room standard fragrance oil for cold-air diffusion in gyms, spas, bathrooms, and focus spaces.',
      longDescription:
        'Camphorous eucalyptus sharpened with mint and spearmint — the steam-room standard. Eucalyptus Mint is functional fragrance: it makes air feel cooler, breathing feel easier, and a space feel professionally clean.',
      bestFor: {
        auto: 'Gym commutes and summer heat. Instant cool-down.',
        home: 'Bathrooms and home gyms. Spa shower, every shower.',
        office: 'Focus rooms. Clears the head between calls.',
        industrial: 'Gyms, spas, and saunas. The expected scent, done properly.',
      },
    },
    'lavender-haze': {
      metaTitle: 'Lavender Haze — Calming Lavender Scent | Autivara',
      metaDescription:
        'Lavender, chamomile, and vanilla — soft, rounded calming fragrance oil for cold-air diffusion in bedrooms, waiting rooms, and wind-down spaces.',
      longDescription:
        'True lavender rounded with chamomile and a trace of vanilla. Lavender Haze takes the most-loved calming note in fragrance and smooths its herbal edges — calm as an ambient setting rather than an aromatherapy statement.',
      bestFor: {
        auto: 'Traffic-heavy commutes. Lowers the cabin temperature, emotionally.',
        home: 'Bedrooms and nurseries. The wind-down signal.',
        office: 'Wellness rooms and HR corners. De-escalation by design.',
        industrial: 'Dental offices, medspas, and waiting rooms. Measured, familiar calm.',
      },
    },
    'green-bamboo': {
      metaTitle: 'Green Bamboo — Clean Green Tea Scent | Autivara',
      metaDescription:
        'Bamboo, green tea, and aloe — light, watery green fragrance oil for waterless cold-air diffusion. Balanced serenity for any modern space.',
      longDescription:
        'Cut bamboo, steeped green tea, and cool aloe water. Green Bamboo is serenity in scent form — light, watery, and balanced, the fragrance equivalent of a minimalist room with one perfect plant.',
      bestFor: {
        auto: 'Minimalist and EV interiors. Clean-air aesthetic, matched.',
        home: 'Sunrooms, plant corners, and bathrooms. Indoor-garden freshness.',
        office: 'Open studios and wellness-led workplaces. Calm productivity.',
        industrial: 'Yoga studios, medspas, and eco-retail. Wellness positioning, bottled.',
      },
    },
  };

  const e = enrichment[oil.id] ?? {
    metaTitle: `${oil.id} | Autivara`,
    metaDescription: oil.description,
    longDescription: oil.description,
    bestFor: { auto: oil.description, home: oil.description, office: oil.description, industrial: oil.description },
  };

  return { ...oil, ...e };
});

export function getScent(slug: string): ScentEntry | undefined {
  return SCENTS.find((s) => s.id === slug);
}
