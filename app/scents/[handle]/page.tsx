import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SCENTS, getScent } from '@/lib/scent-catalog';
import { getUpsellProducts } from '@/lib/shopify';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  return SCENTS.map((s) => ({ handle: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const scent = getScent(handle);
  if (!scent) return { title: 'Scent' };
  const canonical = `/scents/${handle}`;
  return {
    title: scent.metaTitle,
    description: scent.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: scent.metaTitle,
      description: scent.metaDescription,
      url: canonical,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: scent.metaTitle, description: scent.metaDescription },
  };
}

export default async function ScentPage({ params }: Props) {
  const { handle } = await params;
  const scent = getScent(handle);
  if (!scent) notFound();

  const live = (await getUpsellProducts([scent.productId]).catch(() => []))[0];
  const name = live?.title ?? scent.id;
  const price = live
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: live.priceRange.minVariantPrice.currencyCode,
      }).format(parseFloat(live.priceRange.minVariantPrice.amount))
    : '$35.00';
  const image = live?.featuredImage?.url;

  return (
    <div className="bg-white min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Scents', url: '/scents' },
          { name: name, url: `/scents/${handle}` },
        ]}
      />

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative aspect-square bg-neutral-50 rounded-sm overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                priority
                className="object-contain mix-blend-multiply p-12"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
          <div className="flex flex-col space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
                The Scent
              </span>
              <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tighter leading-[0.9]">
                {name}
              </h1>
              <p className="text-xl lg:text-2xl font-display italic text-neutral-400 tracking-tight">
                {scent.notes}
              </p>
            </div>
            <p className="text-neutral-500 text-lg font-light leading-relaxed max-w-md">
              {scent.longDescription}
            </p>
            <span className="text-2xl font-light tracking-tight text-neutral-900">{price}</span>
          </div>
        </div>
      </section>

      {/* Best For across categories */}
      <section className="bg-neutral-50 py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
              Best For
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight">
              How {name.split(' ')[0]} performs across categories.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: 'Auto', text: scent.bestFor.auto, href: '/auto' },
              { label: 'Home', text: scent.bestFor.home, href: '/home' },
              { label: 'Office', text: scent.bestFor.office, href: '/office' },
              { label: 'Industrial', text: scent.bestFor.industrial, href: '/industrial' },
            ].map((cat) => (
              <div key={cat.label} className="space-y-3 bg-white p-8 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                  {cat.label}
                </h3>
                <p className="text-neutral-600 text-sm font-light leading-relaxed">{cat.text}</p>
                <Link
                  href={cat.href}
                  className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] underline underline-offset-4 hover:text-neutral-500"
                >
                  Explore {cat.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA back to scent catalog */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <Link
            href="/scents"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-neutral-500 transition-colors"
          >
            ← All Scents
          </Link>
        </div>
      </section>
    </div>
  );
}
