import type { Metadata } from 'next';
import Link from 'next/link';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import FaqJsonLd from '@/components/FaqJsonLd';

export const metadata: Metadata = {
  title: 'FAQ — How Autivara Diffusers Work, Shipping & Returns',
  description:
    'Answers about Autivara product details, compatibility, ordering, shipping, and returns.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Autivara FAQ',
    description: 'Product details, compatibility, shipping, and returns.',
    url: '/faq',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

type FaqGroup = { heading: string; items: { question: string; answer: string }[] };

const FAQ_GROUPS: FaqGroup[] = [
  {
    heading: 'Products and compatibility',
    items: [
      {
        question: 'How do I confirm how a diffuser works?',
        answer:
          'Check the product page for the current mechanism, power source, fill instructions, and included components. These details vary by model and are not universal across the collection.',
      },
      {
        question: 'Which oil or refill can I use?',
        answer:
          'Use only a refill type explicitly listed on the product page or in the instructions supplied with that model. If compatibility is not stated, contact support before adding an oil or refill.',
      },
      {
        question: 'How do I confirm commercial installation and coverage?',
        answer:
          'Coverage and installation depend on the exact model, room volume, layout, ventilation, and operating conditions. Send the product and space details to support before purchasing equipment for a commercial installation.',
      },
      {
        question: 'Are they safe to run around children and pets?',
        answer:
          'Follow the product instructions and oil label, keep concentrated fragrance products out of reach, and consider individual fragrance sensitivities. Product-specific safety features must be confirmed on the relevant product page or instructions.',
      },
    ],
  },
  {
    heading: 'Fragrance oils & refills',
    items: [
      {
        question: 'Are all Autivara oils compatible with every diffuser?',
        answer:
          'No universal compatibility claim applies across the collection. Use the compatibility information for the specific diffuser and oil, and contact support if the pairing is not listed.',
      },
      {
        question: 'Can I use my own oils?',
        answer:
          'Only when the product instructions explicitly allow it. Oil composition and diffuser mechanisms vary, so do not assume that a third-party oil is suitable for a particular device.',
      },
      {
        question: 'How long does a refill last?',
        answer:
          'Runtime and refill frequency vary by model, capacity, settings, environment, and use. Refer to the product instructions rather than a collection-wide estimate.',
      },
    ],
  },
  {
    heading: 'Orders, shipping & returns',
    items: [
      {
        question: 'Where do you ship and how long does it take?',
        answer:
          'Enter the delivery address at checkout to see the methods, destinations, costs, and estimates currently available. See our shipping page for the full policy.',
      },
      {
        question: 'What is your return policy?',
        answer:
          'Contact support within 30 days of delivery to request a return. Eligibility and the available resolution depend on the item and its condition; see the returns page before sending anything back.',
      },
      {
        question: 'Do you offer wholesale or custom-branded units for businesses?',
        answer:
          'Contact support with the products, quantities, destination, and project requirements. We will confirm what options are currently available rather than promising a program in advance.',
      },
      {
        question: 'How do I reach a real person?',
        answer:
          'Email support@autivara.com or use the contact page. Include the product or order number when applicable so the request can be reviewed efficiently.',
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
            Product details, compatibility, shipping, and returns.
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
            — include the product or order number when applicable.
          </p>
        </div>
      </div>
    </div>
  );
}
