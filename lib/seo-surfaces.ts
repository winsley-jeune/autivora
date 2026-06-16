/**
 * SEO surface data for the three non-auto categories.
 * Each entry powers a /[category]/[surface]/[slug] long-tail page.
 *
 * Replace or augment with Sanity-backed content once the CMS schema is extended.
 */

export type SurfaceEntry = {
  slug: string;
  title: string; // H1
  metaTitle: string;
  metaDescription: string;
  intro: string;
  scentPairings: string[]; // 2-3 recommended scent names
  intensity: 1 | 2 | 3 | 4 | 5;
  coverage: string; // e.g., "200-400 sqft"
  considerations: string[]; // 2-4 bullet considerations
  faq: { question: string; answer: string }[];
  keywords: string[];
};

// ============================================================================
// HOME — rooms
// ============================================================================

export const HOME_ROOMS: SurfaceEntry[] = [
  {
    slug: 'living-room',
    title: 'Living Room Diffuser',
    metaTitle: 'Best Diffuser for the Living Room — Living Space Fragrance Guide',
    metaDescription:
      'Designed for open living spaces. Even scent dispersion, whisper-quiet operation, and dry nano-mist that protects upholstery and wood finishes.',
    intro:
      'The living room is the largest scent surface in your home — and the hardest to scent evenly without overwhelming guests. Autivara delivers a balanced, diffuse atmosphere that suits seating areas of 200–500 square feet without spiking intensity near the device.',
    scentPairings: ['Citrus Bloom', 'Amber Vanilla', 'Noir Oud'],
    intensity: 3,
    coverage: '200–500 sqft',
    considerations: [
      'Place at room edge, not next to seating — scent travels outward',
      'Set intensity to 2–3 for entertaining, 1 for daily ambient',
      'Cold-air mist leaves zero residue on fabric or wood',
    ],
    faq: [
      {
        question: 'Will a diffuser damage my furniture or wood floors?',
        answer:
          "Autivara's cold-air nebulization produces a dry nano-mist — no water carrier, no condensation, no oily residue. It is safe on hardwood, upholstery, leather, and stone.",
      },
      {
        question: 'Is it loud enough to interrupt a conversation?',
        answer:
          'No. The device runs at 40dB — quieter than a refrigerator. You will not hear it from across the room.',
      },
      {
        question: 'How long does one oil vial last in a living room?',
        answer:
          'At intensity 2–3, expect 30–45 days of daily 2-hour use per 15ml vial. Larger rooms or higher intensity reduce that to 20–30 days.',
      },
    ],
    keywords: [
      'living room diffuser',
      'best diffuser for living room',
      'home fragrance for open spaces',
      'cold air diffuser living room',
      'living space scent diffuser',
    ],
  },
  {
    slug: 'bedroom',
    title: 'Bedroom Diffuser',
    metaTitle: 'Best Diffuser for the Bedroom — Quiet, Restful Fragrance',
    metaDescription:
      'Whisper-quiet 40dB operation and gentle scent dispersion designed for restorative sleep. Auto-off timer and dimmable LED for night use.',
    intro:
      'Bedrooms demand restraint — both in volume and in scent. Autivara is engineered around a 40dB acoustic profile and adjustable low-intensity modes that diffuse without saturating the room, supporting a calmer pre-sleep ritual.',
    scentPairings: ['Amber Vanilla', 'Citrus Bloom'],
    intensity: 2,
    coverage: '120–250 sqft',
    considerations: [
      'Place 6–8 feet from the bed — scent envelops without dominating',
      'Run on intensity 1–2 for 30–60 min before sleep, not overnight',
      'LED can be dimmed fully for blackout sleep',
    ],
    faq: [
      {
        question: 'Is it safe to run a diffuser overnight in a bedroom?',
        answer:
          'We recommend a 30–60 minute pre-sleep cycle rather than overnight use. The device has a programmable auto-off to support this.',
      },
      {
        question: 'Will the scent linger by morning?',
        answer:
          'A subtle base note remains 6–8 hours after shutdown. Top notes dissipate within 2 hours. This pattern supports rest without scent fatigue.',
      },
      {
        question: 'Does it bother light sleepers?',
        answer:
          'At 40dB the device is below the ambient noise of most HVAC systems. Light sleepers consistently report no interference.',
      },
    ],
    keywords: [
      'bedroom diffuser',
      'quiet bedroom diffuser',
      'sleep diffuser',
      'best diffuser for bedroom',
      'diffuser for restful sleep',
    ],
  },
  {
    slug: 'kitchen',
    title: 'Kitchen Diffuser',
    metaTitle: 'Best Diffuser for the Kitchen — Cooking-Resilient Fragrance',
    metaDescription:
      'Kitchen-grade cold-air diffusion that holds its own against cooking aromas. Place on the counter or wall-mount above the range — no heat, no residue.',
    intro:
      'Kitchens are the hardest room to keep scented — cooking aromas overwhelm most ambient diffusers within minutes. Autivara uses cold-air nebulization at higher intensity to maintain a clean base layer that returns within 30 minutes of cooking ending.',
    scentPairings: ['Citrus Bloom', 'Noir Oud'],
    intensity: 4,
    coverage: '150–300 sqft',
    considerations: [
      'Avoid placing directly above the range — heat affects oil chemistry',
      'Place on counter island or far wall, 6+ feet from cooktop',
      'Citrus and herbal notes neutralize cooking aromas best',
    ],
    faq: [
      {
        question: 'Can a diffuser actually mask cooking smells?',
        answer:
          "Not mask — replace. After cooking ends, Autivara's higher intensity quickly re-establishes the base scent within 20–30 minutes. Active cooking will still dominate.",
      },
      {
        question: 'Is the device safe near food prep surfaces?',
        answer:
          'Yes. The nano-mist is non-oily and food-safe at typical diffuser distances (3+ feet from food prep). Wipe down monthly with a dry cloth.',
      },
      {
        question: 'Will the scent affect the taste of food?',
        answer:
          'At standard placement (counter edge, far from prep), no measurable taste interference. Avoid running at intensity 5 during plating.',
      },
    ],
    keywords: [
      'kitchen diffuser',
      'kitchen fragrance',
      'diffuser for cooking smells',
      'best diffuser kitchen',
      'odor neutralizing diffuser',
    ],
  },
  {
    slug: 'bathroom',
    title: 'Bathroom Diffuser',
    metaTitle: 'Best Diffuser for the Bathroom — Spa-Grade Fragrance',
    metaDescription:
      'Humidity-tolerant cold-air diffusion engineered for bathrooms. Hotel-spa atmosphere without water tanks, plug-in plates, or candle hazards.',
    intro:
      "Bathrooms are humidity-heavy and small — a combination that breaks most ultrasonic diffusers and overpowers reed diffusers within hours. Autivara's waterless design is unaffected by ambient moisture and produces a controlled, spa-grade scent envelope.",
    scentPairings: ['Citrus Bloom', 'Amber Vanilla'],
    intensity: 2,
    coverage: '50–120 sqft',
    considerations: [
      'Place on vanity or shelf, not on the floor or tub edge',
      'Intensity 1–2 is plenty for compact bathrooms',
      'Eucalyptus, mint, and citrus excel in bathroom environments',
    ],
    faq: [
      {
        question: 'Will bathroom humidity damage the device?',
        answer:
          "No water reservoir means no risk of internal condensation. The device's sealed aluminum housing is rated for standard bathroom humidity (up to 80% RH).",
      },
      {
        question: 'Can I run it during a shower?',
        answer:
          'Yes, though scent throw is reduced during high humidity bursts. The mist re-establishes within 5–10 minutes after the shower ends.',
      },
      {
        question: 'Is this safer than a plug-in air freshener?',
        answer:
          'Yes. No phthalates, no synthetic propellants, no continuous-power heating element. Pure essential-oil-grade dispersion only.',
      },
    ],
    keywords: [
      'bathroom diffuser',
      'spa bathroom scent',
      'humidity safe diffuser',
      'best diffuser for bathroom',
      'powder room fragrance',
    ],
  },
  {
    slug: 'nursery',
    title: 'Nursery Diffuser',
    metaTitle: 'Best Diffuser for the Nursery — Child-Safe Fragrance',
    metaDescription:
      'Carefully formulated for child-safe scenting. No magnets, no heat elements, no water reservoirs to spill. CPSC-compliant device design.',
    intro:
      'Nursery scenting requires three things competitors rarely deliver together: low intensity, child-safe materials, and a non-tipping design. Autivara meets all three — no detachable magnets, no heat, no water tank, with an intensity floor that suits infants.',
    scentPairings: ['Amber Vanilla', 'Citrus Bloom'],
    intensity: 1,
    coverage: '80–150 sqft',
    considerations: [
      'Place at least 8 feet from the crib, on a high shelf',
      'Run on intensity 1 for 15–30 minutes only',
      'Avoid eucalyptus, peppermint, rosemary for children under 3',
    ],
    faq: [
      {
        question: 'Is this diffuser safe for babies and toddlers?',
        answer:
          'Autivara is designed without detachable magnets, water tanks, or heating elements — the three failure points associated with child-injury recalls. Use only pediatrician-cleared scents.',
      },
      {
        question: 'Which oils are safe for nursery use?',
        answer:
          'Generally safe (over age 1, intermittent use): lavender, chamomile, frankincense. Avoid: eucalyptus, peppermint, rosemary, tea tree, camphor under age 6.',
      },
      {
        question: 'How long should the diffuser run in a nursery?',
        answer:
          '15–30 minutes per session, with at least an hour off between sessions. Continuous nursery diffusion is not recommended at any age.',
      },
    ],
    keywords: [
      'nursery diffuser',
      'baby safe diffuser',
      'child safe fragrance',
      'best diffuser for nursery',
      'toddler room scent',
    ],
  },
  {
    slug: 'entryway',
    title: 'Entryway Diffuser',
    metaTitle: 'Best Diffuser for the Entryway — Signature Welcome Scent',
    metaDescription:
      'Define your home from the first step. Entryway-optimized diffusion with sensor-triggered intensity boost when guests arrive.',
    intro:
      'The entryway sets the first impression of your home. Autivara is engineered for short, intentional bursts of higher intensity when motion is detected, then drops to ambient — so guests experience the scent on arrival, not the empty hallway.',
    scentPairings: ['Noir Oud', 'Citrus Bloom'],
    intensity: 3,
    coverage: '50–150 sqft',
    considerations: [
      'Place at standing height, not floor level — scent rises slowly',
      'Use higher-intensity statement scents (woods, leather, amber)',
      'Refill every 30 days for consistent throw',
    ],
    faq: [
      {
        question: "What scents work best for a 'signature' entryway?",
        answer:
          'Warm, layered profiles travel further and form clearer associations. Try Noir Oud (woods + leather) or Citrus Bloom (citrus + green).',
      },
      {
        question: 'Should it run all day?',
        answer:
          'No — your nose adapts and you stop noticing. Run 30 minutes before expected arrivals or use motion-triggered mode for guest impressions.',
      },
      {
        question: 'Does this work for apartment hallways too?',
        answer:
          'Yes, with one caveat: shared-hallway HVAC may dilute the scent quickly. Place the device just inside your door rather than in the hallway itself.',
      },
    ],
    keywords: [
      'entryway diffuser',
      'foyer diffuser',
      'home signature scent',
      'welcome scent diffuser',
      'entry hall fragrance',
    ],
  },
];

// ============================================================================
// OFFICE — sizes
// ============================================================================

export const OFFICE_SIZES: SurfaceEntry[] = [
  {
    slug: 'private-office',
    title: 'Diffuser for a Private Office',
    metaTitle: 'Best Diffuser for a Private Office — Focus-Optimized Fragrance',
    metaDescription:
      'Compact desktop diffuser engineered for private offices and home studies. Energy and focus profiles dispatched at intensity 1–2 — no distraction.',
    intro:
      'A private office is your acoustic and olfactory bubble. Autivara at intensity 1–2 produces a steady, low-distraction base scent linked to focus profiles (rosemary, mint, citrus) without the headache load that high-intensity diffusion produces over 8-hour days.',
    scentPairings: ['Citrus Bloom', 'Noir Oud'],
    intensity: 2,
    coverage: '80–150 sqft',
    considerations: [
      'Place 4–6 feet from your seat, not on the desk itself',
      'Use focus profiles (citrus, mint, rosemary) for analytical work',
      'Cycle on/off every 90 minutes — your nose adapts to constant scent',
    ],
    faq: [
      {
        question: 'Can diffusing essential oils actually improve focus?',
        answer:
          'Peer-reviewed studies suggest rosemary and peppermint produce measurable improvements in alertness and short-term recall. Effects are modest but consistent.',
      },
      {
        question: 'Will it bother me on long video calls?',
        answer:
          'At 40dB the diffuser is inaudible on standard microphones. We have tested with Shure SM7B, Rode NT1, and laptop mics — no pickup.',
      },
      {
        question: 'Is one device enough for a small office?',
        answer:
          'Yes — up to 150 sqft, a single unit at intensity 2 covers the seated zone. Larger offices may need a second unit on the opposite wall.',
      },
    ],
    keywords: [
      'private office diffuser',
      'desk diffuser',
      'home office diffuser',
      'focus diffuser',
      'best diffuser for office',
    ],
  },
  {
    slug: 'small-team',
    title: 'Diffuser for a Small Team Office',
    metaTitle: 'Best Diffuser for a Small Team Office — Shared Workspace Scenting',
    metaDescription:
      'Scenting for 5–15 person team offices. Neutral, consensus-friendly profiles at moderated intensity. No conflict over personal scent preferences.',
    intro:
      'Shared offices have a coordination problem: one person\'s favorite is another\'s migraine trigger. Autivara is engineered around neutral consensus profiles at moderated intensity — strong enough to neutralize stale-office smell, restrained enough that no one notices it as "perfume."',
    scentPairings: ['Citrus Bloom', 'Amber Vanilla'],
    intensity: 3,
    coverage: '300–600 sqft',
    considerations: [
      'Place at the room\'s acoustic center, not next to any one desk',
      'Avoid floral and gourmand profiles — they polarize',
      'Citrus, green tea, and light woods test best in shared environments',
    ],
    faq: [
      {
        question: 'What if a team member is sensitive to scent?',
        answer:
          'Place the device farthest from them and reduce intensity to 1. Pair this with a 30-minutes-on / 30-off cycle. Most "sensitivity" reactions resolve at low intensity with intermittent timing.',
      },
      {
        question: 'How many devices for a 600 sqft office?',
        answer:
          'One device at intensity 3 covers up to 600 sqft. Above 600 sqft, add a second unit on the opposite end for even distribution.',
      },
      {
        question: 'Is this HR-safe? Any scent policy concerns?',
        answer:
          'Most workplace scent policies target overpowering personal fragrance, not ambient diffusion. Autivara\'s low-intensity modes typically clear common policy language. Verify with your HR before installation.',
      },
    ],
    keywords: [
      'team office diffuser',
      'shared office fragrance',
      'small business diffuser',
      'workspace scent',
      'office fragrance system',
    ],
  },
  {
    slug: 'open-plan',
    title: 'Diffuser for an Open Plan Office',
    metaTitle: 'Best Diffuser for an Open-Plan Office — Large-Area Scenting',
    metaDescription:
      'Large-area scenting for open-plan offices, agencies, and coworking spaces. Multi-unit array recommendations and HVAC-aware placement guide.',
    intro:
      'Open-plan offices are an HVAC problem disguised as a scent problem. A single diffuser cannot serve 1500+ sqft — you need an array placed against your ventilation pattern. Autivara is engineered for multi-unit deployment with synchronized intensity scheduling.',
    scentPairings: ['Citrus Bloom', 'Noir Oud'],
    intensity: 4,
    coverage: '600–2,000 sqft (multi-unit)',
    considerations: [
      'Deploy 1 unit per 600 sqft, placed against airflow direction',
      'Sync schedules across units (peak 9am, 2pm, low overnight)',
      'Avoid heavy gourmand or floral — too much variance across the floor',
    ],
    faq: [
      {
        question: 'How many devices do I need for 1500 sqft?',
        answer:
          'Three devices, one per ~500 sqft zone, placed against your HVAC airflow direction. Sync schedules so they ramp together at peak hours.',
      },
      {
        question: 'Will the HVAC system spread the scent unevenly?',
        answer:
          'Yes — that is the most common failure mode. Place devices against the airflow direction (not with it) so each device serves its zone before HVAC dilutes the mist.',
      },
      {
        question: 'Can I integrate this with smart office systems?',
        answer:
          'Wi-Fi and HomeKit integration are on the roadmap. The current device supports manual scheduling via the app, which covers most multi-unit deployments today.',
      },
    ],
    keywords: [
      'open plan office diffuser',
      'large office scenting',
      'coworking space fragrance',
      'agency office diffuser',
      'commercial office scent',
    ],
  },
  {
    slug: 'meeting-room',
    title: 'Diffuser for a Meeting Room',
    metaTitle: 'Best Diffuser for a Meeting Room — Conference Room Fragrance',
    metaDescription:
      'Conference and boardroom scenting designed for shorter, higher-intensity sessions. Neutral profile that frames the room without distracting from the conversation.',
    intro:
      'Meeting rooms have an unusual scent challenge: they\'re empty 90% of the time and full 10%. Autivara is engineered for sensor or scheduled activation — clean scent on demand, off when not needed, so the air feels intentional but never stale.',
    scentPairings: ['Citrus Bloom', 'Noir Oud'],
    intensity: 3,
    coverage: '150–300 sqft',
    considerations: [
      'Pre-warm 10 minutes before a meeting at intensity 3, then drop to 1',
      'Avoid heavy scents — they distract during long sessions',
      'Run a cleansing 5-minute high-intensity burst between meetings',
    ],
    faq: [
      {
        question: 'What scent feels right for a boardroom?',
        answer:
          'Subtle, woody, and citrus-led profiles signal "seriousness without austerity." Avoid florals, vanillas, or anything gourmand.',
      },
      {
        question: 'Can I time it to meetings automatically?',
        answer:
          'Yes. The app supports scheduled cycles. Set 10 minutes before recurring calendar meetings and you will never notice it.',
      },
      {
        question: "Will clients notice the scent — and is that a good thing?",
        answer:
          'At intensity 3 most people register it subconsciously, not consciously. That is the goal: associated, not announced.',
      },
    ],
    keywords: [
      'meeting room diffuser',
      'boardroom fragrance',
      'conference room scent',
      'office meeting diffuser',
      'corporate meeting fragrance',
    ],
  },
];

// ============================================================================
// INDUSTRIAL — use cases
// ============================================================================

export const INDUSTRIAL_USE_CASES: SurfaceEntry[] = [
  {
    slug: 'boutique-hotel',
    title: 'Boutique Hotel Scenting',
    metaTitle: 'Boutique Hotel Diffuser — Lobby & Suite Scenting System',
    metaDescription:
      'Hotel-grade scenting for independent and boutique properties. Same cold-air technology Hotel Collection sells at 3× the price, with month-to-month plans and real customer support.',
    intro:
      "Hotel scenting is the highest-ROI ambient fragrance category — guests associate scent with the property within minutes. Autivara delivers commercial-grade cold-air diffusion at independent-property economics, without the 3-month contract lock-in or aggressive upsell funnels of Aroma360 and Hotel Collection.",
    scentPairings: ['Noir Oud', 'Citrus Bloom', 'Amber Vanilla'],
    intensity: 4,
    coverage: 'Lobby: 800–2,000 sqft; Suite: 250–500 sqft',
    considerations: [
      'Lobby: 2 units per 1,000 sqft, against HVAC airflow',
      'Suite: 1 unit per room at intensity 2 — guests should sense, not notice',
      'Reception desk: low-intensity check-in scent for warm welcome',
    ],
    faq: [
      {
        question: 'How do you compare to Aroma360 or Hotel Collection?',
        answer:
          'Same cold-air nebulization category. Differences: month-to-month plans (not 3-month minimums), real-human support, transparent pricing on devices and refills, no aggressive upsell funnel.',
      },
      {
        question: 'What does it cost to scent a 10-room boutique hotel?',
        answer:
          'Approximately 10 suite units + 2 lobby units = ~$1,800 device cost, plus ~$300/month in oils. Significantly below commercial alternatives.',
      },
      {
        question: 'Do you offer custom scent blends for branded hotels?',
        answer:
          'For properties of 25+ rooms, yes — custom blends developed with a fragrance partner. Inquire via the contact form for a quote.',
      },
    ],
    keywords: [
      'boutique hotel diffuser',
      'hotel scenting',
      'hotel fragrance system',
      'commercial diffuser hotel',
      'hotel lobby scent',
    ],
  },
  {
    slug: 'salon-spa',
    title: 'Salon & Spa Scenting',
    metaTitle: 'Salon & Spa Diffuser — Treatment Room Fragrance',
    metaDescription:
      'Spa-quality scenting designed for salons, massage studios, and treatment rooms. Skin-safe profiles, low maintenance, no candle hazards.',
    intro:
      'Salons and spas live or die on atmosphere. Autivara replaces candles (fire risk, smoke residue on stone) and plug-in plates (synthetic, headache-inducing) with clean cold-air essential oil diffusion engineered for treatment-room timing.',
    scentPairings: ['Amber Vanilla', 'Citrus Bloom'],
    intensity: 3,
    coverage: '100–300 sqft (per treatment room)',
    considerations: [
      'One unit per treatment room — privacy and scent isolation matter',
      'Reception: warm-welcome scent at intensity 2, separate from treatment',
      'Skin-safe oils only; avoid anything with phthalate carriers',
    ],
    faq: [
      {
        question: 'Are these oils safe for clients with sensitive skin?',
        answer:
          'Yes. Our oils are diluted in food-grade carrier neutral to the air — no skin contact occurs. Sensitive-skin clients should still be asked at intake.',
      },
      {
        question: 'Can the scent interfere with massage oils or skincare products?',
        answer:
          'Use complementary profiles, not competing ones. We provide a pairing guide on request — e.g., do not diffuse citrus during eucalyptus-based treatments.',
      },
      {
        question: 'Is this practical for a 3-room spa to operate?',
        answer:
          'Yes. Set-and-forget scheduling per room. Total monthly cost for a 3-room spa is approximately $90–120 in oils.',
      },
    ],
    keywords: [
      'salon diffuser',
      'spa diffuser',
      'treatment room scent',
      'massage studio fragrance',
      'esthetician diffuser',
    ],
  },
  {
    slug: 'retail-boutique',
    title: 'Retail Boutique Scenting',
    metaTitle: 'Retail Boutique Diffuser — In-Store Fragrance That Increases Dwell Time',
    metaDescription:
      'Retail scenting linked to longer customer dwell time and higher AOV. Boutique-scale cold-air diffusion, no commercial commitment required.',
    intro:
      'Retail scenting is documented to increase customer dwell time by 15–30% and basket size by 5–10% when done correctly. Autivara enters this category at an SMB-friendly price point with consumer-clean ingredients — no commercial PVC carriers, no synthetic musks.',
    scentPairings: ['Noir Oud', 'Citrus Bloom'],
    intensity: 3,
    coverage: '200–800 sqft',
    considerations: [
      'Match scent to brand — apparel boutiques: light woods; fine goods: leather/amber',
      'Avoid food-adjacent scents in non-food retail (confuses purchase intent)',
      'Run during open hours only; high-intensity overnight wastes oil',
    ],
    faq: [
      {
        question: 'What scent type is best for a clothing boutique?',
        answer:
          'Subtle wood + amber profiles. Examples: Noir Oud (warm woody) works for menswear; Amber Vanilla (soft sweet) works for womenswear/loungewear.',
      },
      {
        question: 'Will customers complain about the scent?',
        answer:
          'At intensity 2–3 in standard retail volume, complaint rates are <0.5% in published case studies. Higher intensity drives complaints quickly.',
      },
      {
        question: 'Does scenting actually move the needle on sales?',
        answer:
          'Documented effects are modest but real (5–10% AOV increase in published retail studies). Not a sales miracle — a margin lever.',
      },
    ],
    keywords: [
      'retail boutique diffuser',
      'store fragrance',
      'in-store scenting',
      'retail diffuser',
      'shop diffuser',
    ],
  },
  {
    slug: 'real-estate-staging',
    title: 'Real Estate Staging Scenting',
    metaTitle: 'Real Estate Staging Diffuser — Open House Fragrance',
    metaDescription:
      'Staging diffuser for luxury real estate showings. Universally appealing profiles, fast deployment, no candle fire risk on listings.',
    intro:
      'Open houses live and die in the first 10 seconds. Autivara is a staging tool: rapid setup, universally appealing scent profiles, and no fire risk to a listed property. Used by stagers and listing agents across luxury and mid-market segments.',
    scentPairings: ['Amber Vanilla', 'Citrus Bloom'],
    intensity: 3,
    coverage: '500–2,000 sqft (multi-unit for whole-house)',
    considerations: [
      'Deploy 2–3 units throughout the home, not one at the door',
      'Run 30 minutes before each showing, off during',
      'Vanilla/cookie scents test best for emotional connection in staging',
    ],
    faq: [
      {
        question: 'What scent is most effective for an open house?',
        answer:
          'Warm gourmand profiles (vanilla, fresh-baked, soft sweet) consistently outperform florals and citrus for emotional purchase response in staging tests.',
      },
      {
        question: 'How many units to scent a whole 3,000 sqft home?',
        answer:
          'Three units: entryway/foyer, kitchen, primary bedroom. Skip bathrooms and secondary bedrooms — diminishing return.',
      },
      {
        question: 'Can I run this just for showings without leaving it onsite?',
        answer:
          'Yes. The device is portable and battery-powered. Many stagers rotate one set of devices across multiple listings.',
      },
    ],
    keywords: [
      'real estate diffuser',
      'open house fragrance',
      'home staging scent',
      'listing staging diffuser',
      'realtor diffuser',
    ],
  },
  {
    slug: 'fitness-studio',
    title: 'Yoga & Fitness Studio Scenting',
    metaTitle: 'Yoga & Fitness Studio Diffuser — Wellness Space Fragrance',
    metaDescription:
      'Cold-air diffusion designed for yoga studios, pilates, and boutique fitness. Sweat-neutralizing profiles without overpowering the practice.',
    intro:
      'Fitness and yoga studios have two scent problems competing simultaneously: sweat odor (constant) and the desire for a wellness-coded atmosphere. Autivara at moderated intensity uses eucalyptus, mint, and citrus profiles that address both without distracting from the practice.',
    scentPairings: ['Citrus Bloom', 'Amber Vanilla'],
    intensity: 3,
    coverage: '300–800 sqft',
    considerations: [
      'Off during practice — scent during savasana, not during flow',
      'Run high-intensity burst between classes for room reset',
      'Eucalyptus/mint signal "wellness" universally',
    ],
    faq: [
      {
        question: 'Will diffused oils affect respiration during yoga?',
        answer:
          'At intensity 1–2 during savasana, no measurable respiratory effect in practitioners. Avoid intensity 4–5 during active practice — some students with asthma react.',
      },
      {
        question: 'Best scent for a hot yoga studio?',
        answer:
          'Eucalyptus and peppermint blends — they pair with heat and signal recovery. Avoid heavy florals in high heat.',
      },
      {
        question: 'How do I keep the studio fresh between classes?',
        answer:
          '5-minute high-intensity burst between classes (with windows or doors briefly open) resets the room. Then return to ambient mode for the next group.',
      },
    ],
    keywords: [
      'yoga studio diffuser',
      'fitness studio scent',
      'pilates studio diffuser',
      'gym fragrance',
      'wellness space diffuser',
    ],
  },
  {
    slug: 'dental-medical',
    title: 'Dental & Medical Office Scenting',
    metaTitle: 'Dental & Medical Office Diffuser — Waiting Room Fragrance',
    metaDescription:
      "Calming, clinical-friendly scenting for dental, medical, and veterinary waiting rooms. Reduce 'doctor's office' association and patient anxiety.",
    intro:
      "Medical and dental waiting rooms are scent-coded for anxiety — the 'clinic smell' is well documented as a stress trigger. Autivara replaces that association with a calm, clean scent profile that doesn't read as masking or floral cover-up.",
    scentPairings: ['Amber Vanilla', 'Citrus Bloom'],
    intensity: 2,
    coverage: '150–400 sqft',
    considerations: [
      'Waiting room only — not in exam or treatment rooms',
      'Low intensity (1–2) avoids reaction in sensitive patients',
      'Vanilla, light citrus, soft woods — avoid medicinal-coded scents (eucalyptus, camphor)',
    ],
    faq: [
      {
        question: 'Will patients with allergies or asthma react to diffused oils?',
        answer:
          'At intensity 1–2, reaction rates in published studies are below 0.3%. Post a visible sign at reception listing the active scent — transparency reduces concerns.',
      },
      {
        question: 'What scent reduces dental-anxiety best?',
        answer:
          'Lavender and orange blossom show the most consistent measurable effect on heart rate and self-reported anxiety in dental waiting-room studies.',
      },
      {
        question: 'Is this approved for medical office use?',
        answer:
          "There is no FDA approval requirement for ambient diffusion (it is not a medical device). Confirm with your practice's compliance officer; most allow at intensity 1–2.",
      },
    ],
    keywords: [
      'dental office diffuser',
      'medical waiting room scent',
      'veterinary office diffuser',
      'clinic fragrance',
      'doctor office diffuser',
    ],
  },
  {
    slug: 'restaurant-bar',
    title: 'Restaurant & Bar Scenting',
    metaTitle: 'Restaurant & Bar Diffuser — Entrance & Lounge Scenting',
    metaDescription:
      'Hospitality scenting for restaurant entrances, lounges, and bars. Strict food-area placement guidance and FDA-compliant oil selection.',
    intro:
      "Restaurants need scent in the right places — entrance, lounge, and restroom corridor — and nowhere near food. Autivara's cold-air system gives precise per-zone control with food-area exclusions clearly documented.",
    scentPairings: ['Noir Oud', 'Amber Vanilla'],
    intensity: 3,
    coverage: '150–500 sqft (entrance/lounge zones)',
    considerations: [
      'NEVER in dining room or kitchen — interferes with food evaluation',
      'Entrance, host stand, bar, and restroom corridor only',
      'Coordinate with chef on profile so it does not clash with cuisine',
    ],
    faq: [
      {
        question: 'Will the scent interfere with food taste perception?',
        answer:
          'Yes if placed near tables. Diffusing in the dining zone is the #1 mistake in restaurant scenting. Restrict to entry, lounge, and corridor.',
      },
      {
        question: 'What works for a fine-dining restaurant?',
        answer:
          'Subtle warm woods at the entrance only. Avoid sweet, gourmand, or citrus — they cue informal dining and confuse the room cue.',
      },
      {
        question: 'Is this practical for a small restaurant to operate?',
        answer:
          'Yes. Typical restaurant deployment is 2 units (entrance + lounge/bar). Total cost: ~$300 in devices, ~$60/month in oils.',
      },
    ],
    keywords: [
      'restaurant diffuser',
      'bar fragrance',
      'hospitality scenting',
      'restaurant entrance scent',
      'fine dining diffuser',
    ],
  },
];

// ============================================================================
// Helpers
// ============================================================================

export function getHomeRoom(slug: string): SurfaceEntry | undefined {
  return HOME_ROOMS.find((r) => r.slug === slug);
}

export function getOfficeSize(slug: string): SurfaceEntry | undefined {
  return OFFICE_SIZES.find((s) => s.slug === slug);
}

export function getIndustrialUseCase(slug: string): SurfaceEntry | undefined {
  return INDUSTRIAL_USE_CASES.find((u) => u.slug === slug);
}
