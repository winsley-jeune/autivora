import { brandName } from './brand';

type FaqItem = { question: string; answer: string };

const COLLECTION_TAGS = ['car-diffusers', 'home-diffusers', 'industrial-scenting'] as const;

function collectionOf(tags: string[] | undefined): string | null {
  return tags?.find((t) => (COLLECTION_TAGS as readonly string[]).includes(t)) ?? null;
}

// Per-product FAQ overrides, keyed by handle — written by agents/product/. Every product in a
// collection shares the same 3-4 questions below (just the name token swapped), which reads to
// Google as near-duplicate content across the whole catalog and was a real contributor to most
// product pages sitting at "Discovered - currently not indexed" (see agents/ARCHITECTURE.md).
// An override here replaces the generic collection-level fallback with questions genuinely
// specific to that product (its actual design/theme/differentiator, not just its category).
export const PRODUCT_FAQ_OVERRIDES: Record<string, FaqItem[]> = {
  "autivora-smart-plug-diffuser": [
  {
    "question": "How does the Autivara Plug install compared to the wall-mounted Atmos units?",
    "answer": "There's nothing to mount or wire — it plugs straight into a standard wall outlet and it's running. That makes it the easiest way to add scent to a lobby, small office, or guest suite without touching your walls or HVAC."
  },
  {
    "question": "How do I refill the oil?",
    "answer": "The refill snaps in magnetically, so you just pull the old cartridge and click the new one into place — no tools, no drips. Refills are ownership-first and you're never required to be on a recurring oil plan, though we do offer an optional one."
  },
  {
    "question": "Can I control run times from my phone?",
    "answer": "Yes. Over Wi-Fi in the Autivara app you can set schedules and intensity levels — full scent during open hours, dialed back or off overnight — which also keeps your oil use predictable."
  },
  {
    "question": "Is the Plug the right pick for a large venue?",
    "answer": "It's sized for a single room or a small space right at the outlet. For large venues you'll want the HVAC-integrated Atmos Pro, and for mid-size areas the wall-mounted Atmos Wi-Fi — the Plug is the quick, self-contained option for smaller rooms."
  }
],

  "autivora-atmos-pro-hvac": [
  {
    "question": "How is the Atmos Pro different from the wall-mounted Atmos Wi-Fi?",
    "answer": "The Wi-Fi model mounts on a wall and scents a single mid-size area. The Atmos Pro instead connects into your building's HVAC ductwork, so one machine pushes fragrance through every vent and covers a whole large venue evenly rather than one room."
  },
  {
    "question": "Does the Atmos Pro need to be tied into my ductwork by a professional?",
    "answer": "Because it feeds scent into your HVAC system, it's meant to be installed at the ducting rather than plugged into an outlet like our wall units. Email support@autivara.com with your setup and we'll walk you and your installer through the right connection point."
  },
  {
    "question": "How does the waterless design affect the air moving through my vents?",
    "answer": "It nebulizes pure oil into a dry fragrance — no water, no steam, no residue riding through your ducts. You get scent carried by the air you're already circulating, without adding moisture to the system."
  },
  {
    "question": "Can I control scent by the hour for open and closed times?",
    "answer": "Yes. The app lets you set schedules and intensity down to the minute, so you can run full strength during business hours and dial it back or shut it off overnight, which also keeps your oil usage predictable."
  }
],

  "autivora-atmos-wifi-diffuser": [
  {
    "question": "How is the Atmos Wi-Fi different from the HVAC-integrated Atmos Pro?",
    "answer": "The Atmos Wi-Fi mounts on a wall and scents the room directly, so there's no ductwork to tie into — ideal for a mid-size office, lobby, or showroom. The Atmos Pro connects to your HVAC to push scent through much larger, multi-room venues."
  },
  {
    "question": "Does it need a water tank or plumbing?",
    "answer": "No. It's fully waterless — it nebulizes pure oil straight into the air, so there's no tank to fill, no water to change, and a cleaner, more consistent scent than a misting unit."
  },
  {
    "question": "How do I control when and how strongly it runs?",
    "answer": "Everything is set from the Wi-Fi app: schedule full scent during open hours and dial it back or off overnight. That also keeps your oil use predictable."
  },
  {
    "question": "How hard is it to swap oils?",
    "answer": "The refill bay is magnetic, so it pops open for a quick oil change with no tools. You own the unit and refill it yourself — there's no required subscription to keep it running."
  }
],

  "autivora-4l-humidifying-diffuser": [
  {
    "question": "How big a room can the 4L tank handle?",
    "answer": "The 4-litre tank is sized for whole-room use — living rooms and larger bedrooms — rather than a single desk. Turn the mist up to fill a dry room, or ease it down for a gentler background scent."
  },
  {
    "question": "How long does one fill last?",
    "answer": "That's the point of the 4-litre tank: it runs for hours on a single fill, so you're not topping it up through the day. Actual run time depends on how high you set the mist output."
  },
  {
    "question": "How do I refill it — do I have to tip it over?",
    "answer": "No. It's a top-fill design, so you just lift the lid and pour water straight in. Add five to ten drops of fragrance oil and you're set."
  },
  {
    "question": "Can I leave it running overnight?",
    "answer": "Yes. Use the sleep mode and timer to run it while you fall asleep, and it shuts off automatically when the tank runs dry — cool mist, no heat, whisper-quiet."
  }
],

  "autivora-steam-train-diffuser": [
  {
    "question": "Where does the mist come from on the steam-train diffuser?",
    "answer": "Straight out of the smokestack, like a real locomotive letting off steam. The cool ultrasonic mist rises from the funnel, so the scent effect doubles as the train's steam."
  },
  {
    "question": "Is the Express more of a display piece or a working diffuser?",
    "answer": "Both. It's a finely detailed, collectible locomotive that looks the part on a shelf or desk, and it genuinely diffuses scented mist while it does — no compromise between looks and function."
  },
  {
    "question": "Does it get hot or use flame like a real train?",
    "answer": "No. The mist is cool ultrasonic mist with no heat and no flame, so it's safe to leave on a shelf, desk, or nightstand. The 'steam' from the stack is fine, cool fragrance mist."
  },
  {
    "question": "Can I use my own oils in the Express, or do I have to buy refills?",
    "answer": "Use any diffuser-grade fragrance or essential oil — just add a few drops to the water tank. Our Autivara oils are blended for these units, but there's no required subscription and you're never locked in."
  }
],

  "autivora-wood-grain-diffuser": [
  {
    "question": "Does the Grove have a flame or light-show effect like the other Autivara diffusers?",
    "answer": "No — and that's the point. The Grove skips the flame glow and mirror-ball effects for a single soft ambient light and a natural wood-grain body, so it's the one to pick if you want scent that quietly blends into a room rather than becoming the centerpiece."
  },
  {
    "question": "Where does the wood-grain look fit best?",
    "answer": "Its warm wood-grain finish suits neutral, minimal, and natural interiors — a bedroom nightstand, a living-room shelf, or an office desk where a bright color or a novelty shape would clash."
  },
  {
    "question": "Is the soft glow bright enough to bother me at night?",
    "answer": "No. The ambient light is a gentle glow rather than a light show, so it's easy to sleep next to on a nightstand, and it runs cool with auto shut-off when the water runs dry."
  },
  {
    "question": "Can I use my own oils in it?",
    "answer": "Yes. Add five to ten drops of any diffuser-grade fragrance or essential oil to the water tank. We blend Autivara oils for these ultrasonic units, but there's no required subscription and you're never locked in."
  }
],

  "autivora-disco-ball-diffuser": [
  {
    "question": "What kind of light show does the Nova put on?",
    "answer": "Its mirrored surface throws scattered, disco-ball light across the walls and ceiling, and you can switch between multiple light modes — bright and colourful for a party, or dialled back to a gentle glow for a quiet night in."
  },
  {
    "question": "Can I run the disco lights without the mist, or the mist without the lights?",
    "answer": "Yes — the light show and the cool mist run independently, so you can set the party mood on its own, scent the room on its own, or run both together as a full centerpiece."
  },
  {
    "question": "Is the Nova a good fit for parties and get-togethers?",
    "answer": "That's exactly what it's built for. The spinning mirror-ball effect fills the room with moving light while the ultrasonic mist carries your fragrance through the space, so it works as both the lighting and the scent for a gathering."
  },
  {
    "question": "Do I have to buy Autivara oils to keep it going?",
    "answer": "No. Just top up the tank with water and add a few drops of any diffuser-grade fragrance oil. Our blends are made for these ultrasonic units, but there's no required subscription and you're never locked in."
  }
],

  "autivora-rocket-flame-diffuser": [
  {
    "question": "Where does the mist come out of the Apollo rocket?",
    "answer": "The cool mist rises from the base of the rocket, so it looks like an engine plume lifting the ship off the pad. The flame-glow light sits underneath it to sell the liftoff effect."
  },
  {
    "question": "Is the Apollo small enough for a desk?",
    "answer": "Yes — it has a compact footprint made for a desk, shelf, or bookcase, and it runs off USB so you can power it straight from your laptop or a desk hub."
  },
  {
    "question": "Is the flame under the rocket a real flame?",
    "answer": "No, it's an LED flame-glow effect, so it stays cool and safe to leave running near papers and a monitor. The mist itself is ultrasonic and never hot."
  },
  {
    "question": "Can I use my own oils in the Apollo?",
    "answer": "Yes. Fill the tank with water, add a few drops of any diffuser-grade fragrance or essential oil, and refill as needed — there are no cartridges and no required subscription."
  }
],

  "autivora-fireplace-flame-diffuser": [
  {
    "question": "Does the Hearth's flame look real, and is it actually hot?",
    "answer": "The flickering flame is a realistic LED effect, so it looks like a real fire but stays completely cool. The mist is ultrasonic and never heats up, making it safe to leave on a mantel, shelf, or nightstand."
  },
  {
    "question": "Can I run the flame glow without the mist?",
    "answer": "The Hearth is built to pair its fireplace glow with scented mist, but the multiple timer modes let you control how long it runs — set a short cozy session or let it wind down on its own, with auto shut-off when the tank runs dry."
  },
  {
    "question": "How is the Hearth different from Autivara's other flame diffusers like the Ember volcano?",
    "answer": "Where the Ember volcano lifts a single glowing plume, the Hearth is shaped like a miniature fireplace with a broad flickering flame across the front — designed to bring that classic fireside mood to a room without a real fire."
  },
  {
    "question": "What oils can I use, and do I have to buy refills from Autivara?",
    "answer": "Add five to ten drops of any diffuser-grade fragrance or essential oil to the water tank. Autivara oils are blended for these units, but there's no required subscription and you're never locked in."
  }
],

  "autivora-jellyfish-mist-diffuser": [
  {
    "question": "What makes the Nimbus different from Autivara's flame-glow diffusers?",
    "answer": "Instead of a flickering flame, the Nimbus features drifting jellyfish that sway and glow inside the mist column — a calmer, aquarium-like effect that's popular for bedrooms and kids' rooms."
  },
  {
    "question": "What can the remote control do?",
    "answer": "The handheld remote lets you switch the jellyfish lighting and mist on or off and change the mood from across the room, so you don't have to reach the unit — handy on a nightstand or high shelf."
  },
  {
    "question": "Can I run the jellyfish light without the mist?",
    "answer": "The light and mist are designed to work together for the drifting-jellyfish effect, but the mist runs cool and whisper-quiet and shuts off on its own when the tank empties, so it's fine to leave glowing as a nightlight."
  },
  {
    "question": "Do I have to buy special oil for it?",
    "answer": "No. Add five to ten drops of any diffuser-grade fragrance or essential oil to the water tank. We blend Autivara oils for these units and offer an optional recurring refill plan, but you're never required to sign up."
  }
],

  "autivora-volcano-flame-diffuser": [
  {
    "question": "Does the volcano actually get hot or use a real flame?",
    "answer": "No. The eruption effect is all LED glow lighting behind ultrasonic mist, so the plume looks molten but stays cool to the touch — safe on a shelf, mantel, or nightstand."
  },
  {
    "question": "How does the Ember create its lava-eruption look?",
    "answer": "An ultrasonic plate turns water into a fine cool mist that rises from the volcano's crater, lit from within by warm lava-glow LEDs so it reads like a rising eruption rather than plain steam."
  },
  {
    "question": "How is the Ember powered?",
    "answer": "It's USB powered, so you can run it from a wall adapter, a power bank, or a laptop port — handy for placing it on a mantel or side table without hunting for a free outlet."
  },
  {
    "question": "Can I use my own fragrance oils in it?",
    "answer": "Yes. Fill the tank with water, add a few drops of any diffuser-grade fragrance or essential oil, and top up as it empties. Our Autivara oils are blended for these units, but there's no required subscription and you're never locked in."
  }
],

  "autivora-smart-spray-diffuser": [
  {
    "question": "How is the Pulse different from Autivara's vent-clip diffusers?",
    "answer": "The Pulse doesn't rely on your air vents. It's an active micro-spray that mists fragrance on a timer you program, so you get scent even when the fan is off — plus three intensity modes and a glowing light ring the clip-on models don't have."
  },
  {
    "question": "How does the timed spray work?",
    "answer": "You set the interval and the Pulse automatically releases a fine micro-mist on schedule — no button-pressing on every drive. Pick from three intensity modes for a light background scent or a bolder burst."
  },
  {
    "question": "How do I power and recharge it?",
    "answer": "It's USB-C rechargeable, so you top it up with the same cable as most phones — no disposable batteries and no dangling cord once it's charged."
  },
  {
    "question": "What is the light ring for?",
    "answer": "The ambient light ring adds a soft glow that suits night drives, so the Pulse works as a subtle cabin accent as well as a scent device."
  }
],

  "autivora-rechargeable-car-diffuser": [
  {
    "question": "How is the Cabin different from Autivara's vent-clip diffusers?",
    "answer": "Most Autivara car diffusers clip to an air vent and rely on airflow. The Cabin is powered instead — it recharges over USB-C and runs on its own, so you can set it down wherever suits your interior rather than being tied to a vent."
  },
  {
    "question": "How do I recharge it, and does the scent still work while it's charging?",
    "answer": "It charges with a standard USB-C cable, the same kind you already use for most phones and gadgets. It runs waterless with a few drops of oil, so scent depends on the oil in the core, not the charge — topping up the battery just keeps the diffusion running."
  },
  {
    "question": "Can I control how strong the scent is?",
    "answer": "Yes. The Cabin has adjustable intensity, so you can turn the output up for a bold first impression or keep it low and subtle on longer drives."
  },
  {
    "question": "Do I have to keep buying refills on a plan?",
    "answer": "No. The scent core is waterless and refillable with any Autivara fragrance oil, so you top it up whenever the scent fades. There's no required subscription — you're never required to sign up to keep it running."
  }
],

  "autivora-magnetic-vent-diffuser": [
  {
    "question": "What makes the Disc different from Autivara's novelty car diffusers?",
    "answer": "It's the minimalist grown-up option. Instead of a sculpted figure, the Disc is a plain machined-metal puck — solid, weighty, and understated, so it reads as a quiet design detail on your vent rather than a character piece."
  },
  {
    "question": "How does the magnetic snap work for refills?",
    "answer": "The two-piece metal body pulls apart and closes with a magnet, so you just snap off the top, add a few drops of oil to the felt pad, and snap it shut. No twisting caps or fiddly clips."
  },
  {
    "question": "Is the metal body heavy enough to stay put on my vent?",
    "answer": "It clips securely onto any air vent and the solid metal keeps it stable — no rattling loose over bumps. It's more substantial in hand than the plastic diffusers you'll find elsewhere."
  },
  {
    "question": "Do I have to buy Autivara oil refills on a subscription?",
    "answer": "No — the felt pad is refillable with any fragrance oil you like and you're never required to sign up for a recurring plan. An optional oil plan may be offered later, but you own the diffuser outright."
  }
],

  "autivora-bear-propeller-diffuser": [
  {
    "question": "What makes the propeller spin?",
    "answer": "The airflow from your vent turns it — there are no batteries or charging. When the fan's on, the propeller spins and helps push scent out into the cabin; when it's off, it simply rests."
  },
  {
    "question": "How do I refill the Aviator without making a mess?",
    "answer": "The bear's top is magnetic, so it lifts straight off with a gentle pull. Add a few drops of oil to the waterless core, snap the top back down, and you're done — no unscrewing, no drips."
  },
  {
    "question": "Is this a spinning gimmick or does it actually help the scent?",
    "answer": "Both, honestly. It's a fun novelty piece, but the turning propeller does stir the air right at the vent, so the fragrance carries more evenly through the cabin than a static clip would."
  },
  {
    "question": "Can I switch to a different scent later?",
    "answer": "Anytime. The core is refillable with any Autivara fragrance oil, so you can change scents whenever you like. There's no cartridge to buy and no required subscription — you own the diffuser outright."
  }
],

  "autivora-solar-car-diffuser": [
  {
    "question": "Does the Autivara Solar need batteries or charging?",
    "answer": "Neither. A built-in solar cell spins the rotor whenever daylight reaches your dashboard, so there's nothing to charge and no batteries to swap — it just works when the sun's out."
  },
  {
    "question": "Will the rotor still spin on cloudy days or at night?",
    "answer": "The rotor is powered by light, so it spins fastest in bright sun and slows in low light or after dark. Even when it's still, the waterless oil core keeps giving off a soft scent — the spinning simply pushes it further through the cabin."
  },
  {
    "question": "How is this different from Autivara's airflow-driven vent diffusers?",
    "answer": "Our propeller and rotating clips need moving air to turn. The Solar spins on sunlight instead, so it keeps working even when the vents are off or you're parked in the sun."
  },
  {
    "question": "Can I refill it and change scents?",
    "answer": "Yes. It's waterless and refillable — add a few drops of any Autivara fragrance oil, and switch scents whenever you like. There's an optional oil plan, but you're never required to subscribe."
  }
],
  "autivora-astronaut-car-diffuser": [
  {
    "question": "What makes the Astronaut different from Autivara's other novelty car diffusers?",
    "answer": "It's the original design that defined the line — a finely detailed astronaut figure meant to be displayed on your vent, offered in several colorways so you can pick the one that suits your cabin. It works by simple airflow, no batteries or charging needed."
  },
  {
    "question": "Does the Astronaut need batteries, charging, or sunlight to work?",
    "answer": "No. Unlike our solar or rechargeable models, the Astronaut is powered by the air already moving through your vent, so it just clips on and works — nothing to charge or plug in."
  },
  {
    "question": "Will the oil spill on my dashboard?",
    "answer": "No. It's a waterless design — you add a few drops of fragrance oil to the core rather than filling a water tank, so there's nothing to slosh loose or leave an oily film on your interior."
  },
  {
    "question": "Can I refill the Astronaut and change scents?",
    "answer": "Yes. The scent core is refillable with any Autivara fragrance oil, so you can switch scents whenever you like. You own the diffuser outright, and while we plan to offer an optional recurring oil plan, you're never required to subscribe."  }
],
};

/**
 * Per-product FAQ. Checks PRODUCT_FAQ_OVERRIDES first (real, product-specific content); falls
 * back to the collection-level generic template below for any product not yet enriched. Powers
 * a visible FAQ + FAQPage schema.
 */
export function productFaq(product: {
  handle: string;
  title: string;
  tags?: string[];
}): FaqItem[] {
  if (PRODUCT_FAQ_OVERRIDES[product.handle]) return PRODUCT_FAQ_OVERRIDES[product.handle];

  const name = brandName(product.title);
  const isOil = product.tags?.includes('fragrance-oil');
  const collection = collectionOf(product.tags);

  if (isOil) {
    return [
      {
        question: `Which diffusers does the ${name} work with?`,
        answer:
          'It is a refill fragrance oil that works in any Autivara diffuser — add a few drops to a car vent clip or the water tank of a home unit. There are no proprietary cartridges, so you are free to use it across your devices.',
      },
      {
        question: 'How long does one bottle last?',
        answer:
          'Because you only use a few drops per refill, a single bottle lasts a long time — weeks to months depending on how often and how strongly you scent. A little goes a long way.',
      },
      {
        question: 'Can I mix scents?',
        answer:
          'Yes. Since you own your oils and there are no locked pods, you can layer or alternate Autivara scents to suit the room, the season, or your mood.',
      },
    ];
  }

  if (collection === 'car-diffusers') {
    return [
      {
        question: `How does the ${name} diffuse scent in my car?`,
        answer:
          'It is waterless — you add a few drops of fragrance oil and airflow from your vent (or, on solar models, a sun-powered rotor) carries the scent through the cabin. No water tank, no spills on your interior.',
      },
      {
        question: `How long does a refill last in the ${name}?`,
        answer:
          'Typically one to two weeks per refill, depending on how much oil you add and how often you drive. Add more drops for a stronger scent, fewer for something subtle.',
      },
      {
        question: 'Will it leave residue on my dashboard or vents?',
        answer:
          'No. The oil stays held in the unit rather than sloshing loose, so there is no spill risk and no oily film on your interior. Just refill when the scent fades.',
      },
      {
        question: 'Can I change scents?',
        answer:
          'Anytime. The diffuser is refillable with any Autivara fragrance oil, so you can switch scents whenever the mood changes — you own your scent, not a cartridge.',
      },
    ];
  }

  if (collection === 'home-diffusers') {
    return [
      {
        question: `How does the ${name} work?`,
        answer:
          'It uses cool ultrasonic mist — fill the tank with water, add five to ten drops of fragrance oil, and an ultrasonic plate turns it into a fine, cool mist. No heat, whisper-quiet, with auto shut-off when the tank runs dry.',
      },
      {
        question: 'Is it safe to leave running?',
        answer:
          'Yes. It runs cool to the touch and shuts off automatically when the water runs out, so it is safe on a shelf, desk, or nightstand. Any light effects are LED, not flame.',
      },
      {
        question: 'How often do I refill it?',
        answer:
          'A tank runs for several hours per fill. Top up the water when it empties and add oil to taste — there are no cartridges to buy or replace.',
      },
      {
        question: 'Can I use my own essential oils?',
        answer:
          'Yes. It works with any diffuser-grade fragrance or essential oil suited to a water-based ultrasonic unit. We recommend Autivara oils because they are blended for these devices, but you are never locked in.',
      },
    ];
  }

  if (collection === 'industrial-scenting') {
    return [
      {
        question: `What size space does the ${name} cover?`,
        answer:
          'It is built for commercial coverage using cold-air diffusion that carries fragrance much farther than a home unit. Coverage depends on the room’s air volume — email support@autivara.com with your square footage and we will confirm the right fit.',
      },
      {
        question: 'Do I need a long-term contract?',
        answer:
          'No. You buy the equipment outright and our oil plans are month-to-month — no three-month lock-in like the large scent-marketing firms require.',
      },
      {
        question: 'Can I schedule run times and intensity?',
        answer:
          'On smart models, yes — set run times and strength from the app so you get full scent during open hours and dial it back or off overnight. That also keeps oil cost predictable.',
      },
      {
        question: 'Do you offer multi-unit and custom-branded pricing?',
        answer:
          'Yes. We offer volume pricing for multi-room and multi-site deployments and custom-branded options. Email support@autivara.com with your spaces and we will put a plan together.',
      },
    ];
  }

  // Fallback for any uncategorized product — brand-universal answers.
  return [
    {
      question: `Is the ${name} refillable?`,
      answer:
        'Yes. Every Autivara diffuser is refillable with our fragrance oils — no proprietary cartridges, so you buy the device once and own your scent.',
    },
    {
      question: 'How do I change the scent?',
      answer:
        'Add a different Autivara oil on your next refill. You can switch scents as often as you like to match the room or the season.',
    },
  ];
}
