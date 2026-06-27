import { brandName } from './brand';

type FaqItem = { question: string; answer: string };

const COLLECTION_TAGS = ['car-diffusers', 'home-diffusers', 'industrial-scenting'] as const;

function collectionOf(tags: string[] | undefined): string | null {
  return tags?.find((t) => (COLLECTION_TAGS as readonly string[]).includes(t)) ?? null;
}

/**
 * Per-product FAQ generated from the product's collection. Specific enough to
 * add real value (uses the product name, matches the diffusion type) without
 * hardcoding 19 separate FAQ blocks. Powers a visible FAQ + FAQPage schema.
 */
export function productFaq(product: {
  title: string;
  tags?: string[];
}): FaqItem[] {
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
