import type { Metadata } from 'next';
import Link from 'next/link';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import FaqJsonLd from '@/components/FaqJsonLd';

export const metadata: Metadata = {
  title: 'FAQ — How Autivara Diffusers Work, Shipping & Returns',
  description:
    'Answers about Autivara aroma diffusers — how car, home, and commercial units work, refilling and fragrance oils, battery life, shipping, and returns.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Autivara FAQ',
    description: 'How our diffusers work, refilling and oils, shipping, and returns.',
    url: '/faq',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

type FaqGroup = { heading: string; items: { question: string; answer: string }[] };

const FAQ_GROUPS: FaqGroup[] = [
  {
    heading: 'How the diffusers work',
    items: [
      {
        question: 'How do Autivara car diffusers work?',
        answer:
          'Our car diffusers are waterless. You add a few drops of fragrance oil to the diffuser, clip it to an air vent or set it on the dash, and the airflow (or, on solar models, a sun-powered rotor) carries the scent through the cabin. There is no water tank and no spill risk on your interior.',
      },
      {
        question: 'How do the home diffusers work?',
        answer:
          'Our home diffusers use cool ultrasonic mist. You fill the tank with water, add a few drops of oil, and an ultrasonic plate turns it into a fine, cool mist — no heat, whisper-quiet, with auto shut-off when the tank runs dry. Flame-effect and light-show models add ambient light on top of the mist.',
      },
      {
        question: 'How do the commercial scent machines work?',
        answer:
          'Our commercial units use cold-air (nebulizing) diffusion that carries pure fragrance oil through a space without water or heat — either standalone or connected to an HVAC duct on larger units. Smart models add Wi-Fi scheduling so you control intensity and run times from an app.',
      },
      {
        question: 'Are they safe to run around children and pets?',
        answer:
          'The home units run cool to the touch with auto shut-off, and the car units use no water or heat. As with any fragrance product, keep concentrated oils out of reach, follow the fill guidance for each unit, and ventilate the room if anyone is sensitive to scent. Check the specific oil label for any pet cautions.',
      },
    ],
  },
  {
    heading: 'Fragrance oils & refills',
    items: [
      {
        question: 'Do I have to buy a special cartridge?',
        answer:
          'No. Autivara diffusers are refillable — there are no proprietary pods or locked cartridges. You buy the device once and refill it with any Autivara fragrance oil, so you own your scent.',
      },
      {
        question: 'Can I use my own oils?',
        answer:
          'You can use any quality water-soluble or diffuser-grade fragrance or essential oil that matches the diffusion type (waterless for car, water-based for ultrasonic home units). We recommend our own oils because they are blended and tested for these devices, but you are never locked in.',
      },
      {
        question: 'How long does a refill last?',
        answer:
          'It depends on the unit and how often you run it. A few drops in a car vent clip typically lasts one to two weeks; a home ultrasonic tank runs for hours per fill. Running on a lower setting or on a timer extends how long each refill lasts.',
      },
    ],
  },
  {
    heading: 'Orders, shipping & returns',
    items: [
      {
        question: 'Where do you ship and how long does it take?',
        answer:
          'We ship across North America. Orders are processed within 1–2 business days, with delivery times shown at checkout. See our shipping page for current rates and timelines.',
      },
      {
        question: 'What is your return policy?',
        answer:
          'If a diffuser arrives damaged or is not right for you, contact us and we will make it right. See our returns page for the full window and process. Fragrance oils, for hygiene reasons, are returnable only if unopened.',
      },
      {
        question: 'Do you offer wholesale or custom-branded units for businesses?',
        answer:
          'Yes. We offer multi-unit pricing and custom-branded options for hotels, salons, offices, gyms, and retail. Email support@autivara.com with your space and volume and we will put together a plan.',
      },
      {
        question: 'How do I reach a real person?',
        answer:
          'Email support@autivara.com and a member of our team will reply within one business day. We answer our own support.',
      },
    ],
  },
];

const ALL_ITEMS = FAQ_GROUPS.flatMap((g) => g.items);

export default function FaqPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'FAQ', url: '/faq' },
        ]}
      />
      <FaqJsonLd items={ALL_ITEMS} />

      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">
        <div className="space-y-3 mb-16 border-b border-neutral-100 pb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
            Support
          </span>
          <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tighter leading-[1]">
            Frequently asked questions
          </h1>
          <p className="text-sm text-neutral-400 font-light">
            How our diffusers work, refilling, shipping, and returns.
          </p>
        </div>

        <div className="space-y-14">
          {FAQ_GROUPS.map((group) => (
            <section key={group.heading} className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
                {group.heading}
              </h2>
              <div className="space-y-8">
                {group.items.map((item) => (
                  <div key={item.question} className="space-y-2">
                    <h3 className="text-base font-display font-medium tracking-tight text-black">
                      {item.question}
                    </h3>
                    <p className="text-neutral-600 font-light leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-neutral-100 pt-12 text-neutral-600 font-light">
          <p>
            Still have a question?{' '}
            <Link href="/contact" className="underline hover:text-black">
              Contact us
            </Link>{' '}
            — we reply within one business day.
          </p>
        </div>
      </div>
    </div>
  );
}
