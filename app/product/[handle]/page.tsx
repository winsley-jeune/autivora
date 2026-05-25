import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getProduct, getUpsellProducts } from '@/lib/shopify';
import { Image as ShopifyImage } from '@/lib/shopify-types';
import { SIGNATURE_OILS, type OilCard } from '@/lib/upsell-products';
import UpsellModal from '@/components/UpsellModal';
import SpecsAccordion from '@/components/SpecsAccordion';
import ProductJsonLd from '@/components/ProductJsonLd';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import ProductViewTracker from '@/components/analytics/ProductViewTracker';
import { categoryFromTags } from '@/lib/category';

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};
  const title = product.seo?.title ?? product.title;
  const description =
    product.seo?.description ??
    'Precision cold-air nebulization for the discerning driver. Aerospace-grade aluminum, 48-hour battery, whisper-quiet.';
  const canonical = `/product/${handle}`;
  const ogImage = product.featuredImage?.url;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: ogImage ? [{ url: ogImage, alt: product.featuredImage?.altText ?? product.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

// Fallback images (same ones used on autivora-one editorial page)
const FALLBACKS = {
  hero: '/image/61T6CC0ta-L._AC_SL1500_.jpg',
  tech1: '/image/71G8FzfKNjL._AC_SX679_.jpg',
  tech2: '/image/61YkBrJrPhL._AC_SL1500_.jpg',
  tech3: '/image/71f22Sj2VML._AC_SX679_.jpg',
  craft: '/image/81dWe9a1a2L._AC_SY879_.jpg',
  perf: '/image/6182hqWxxcL._AC_SL1500_.jpg',
  lifestyle: '/image/71aaruoc5QL._AC_SX679_.jpg',
};

function img(images: ShopifyImage[], index: number, fallback: string) {
  return images[index]?.url ?? fallback;
}
function alt(images: ShopifyImage[], index: number, fallback: string) {
  return images[index]?.altText ?? fallback;
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;

  const product = await getProduct(handle);
  if (!product) notFound();

  // Fetch real oil data from Shopify and merge with static config
  const productIds = SIGNATURE_OILS.map((o) => o.productId);
  const shopifyOils = await getUpsellProducts(productIds);
  const oils: OilCard[] = SIGNATURE_OILS.map((oil) => {
    const live = shopifyOils.find((p) => p.id === oil.productId);
    const variantId = live?.variants.edges[0]?.node.id ?? '';
    return {
      id: oil.id,
      variantId,
      name: live?.title ?? oil.id,
      notes: oil.notes,
      description: oil.description,
      price: live
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: live.priceRange.minVariantPrice.currencyCode,
          }).format(parseFloat(live.priceRange.minVariantPrice.amount))
        : '$35.00',
      image: live?.featuredImage?.url,
    };
  });

  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.priceRange.minVariantPrice.currencyCode,
  }).format(parseFloat(product.priceRange.minVariantPrice.amount));

  const firstVariantId = product.variants?.edges?.[0]?.node?.id ?? null;

  // Build deduped image list — featured first, then gallery
  const seen = new Set<string>();
  const images: ShopifyImage[] = [];
  for (const i of [
    product.featuredImage,
    ...(product.images?.edges?.map((e) => e.node) ?? []),
  ]) {
    if (i && !seen.has(i.url)) { seen.add(i.url); images.push(i); }
  }

  return (
    <div className="bg-white text-black min-h-screen selection:bg-black selection:text-white">
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Shop', url: '/collection' },
          { name: product.title, url: `/product/${handle}` },
        ]}
      />
      <ProductViewTracker
        id={product.id}
        name={product.title}
        price={parseFloat(product.priceRange.minVariantPrice.amount)}
        currency={product.priceRange.minVariantPrice.currencyCode}
        category={categoryFromTags(product.tags)}
      />

      {/* 1️⃣ Hero */}
      <section className="pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: hero image */}
          <div className="relative aspect-square bg-neutral-50 flex items-center justify-center overflow-hidden rounded-sm">
            <img
              src={img(images, 0, FALLBACKS.hero)}
              alt={alt(images, 0, product.title)}
              className="w-full h-full object-contain mix-blend-multiply"
            />
            <div className="absolute bottom-8 left-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                Anodized Space Grey
              </span>
            </div>
          </div>

          {/* Right: info */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
                The Device
              </span>
              <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tighter leading-[0.9]">
                {product.title}
              </h1>
              <p className="text-xl lg:text-2xl font-display italic text-neutral-400 tracking-tight">
                Scent. Without Compromise.
              </p>
            </div>

            <p className="text-neutral-500 text-lg font-light leading-relaxed max-w-md">
              {product.description ||
                'Autivora diffuses fragrance in its purest form — no water, no heat, no dilution. Precision nano-vapor technology preserves the integrity of every note.'}
            </p>

            <div className="space-y-6">
              <span className="text-2xl font-light tracking-tight text-neutral-900">{price}</span>

              <div className="flex flex-col space-y-6">
                {firstVariantId ? (
                  <UpsellModal variantId={firstVariantId} oils={oils} />
                ) : (
                  <button
                    disabled
                    className="w-full lg:w-max px-16 py-5 bg-neutral-200 text-neutral-400 text-[11px] font-bold uppercase tracking-[0.3em] rounded-sm cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
                <Link
                  href="/fitment"
                  className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-black transition-colors"
                >
                  Vehicle Compatibility{' '}
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2️⃣ Trust strip */}
      <section className="border-y border-neutral-100 py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 text-center flex-1">
            Engineered in Europe
          </span>
          <div className="hidden md:block w-[1px] h-4 bg-neutral-100" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 text-center flex-1">
            Precision Nebulization Technology
          </span>
          <div className="hidden md:block w-[1px] h-4 bg-neutral-100" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 text-center flex-1">
            Designed for Performance Interiors
          </span>
        </div>
      </section>

      {/* 3️⃣ Technology */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto space-y-24">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-display font-medium tracking-tight">
              Engineered for the Invisible.
            </h2>
            <p className="text-neutral-500 text-lg font-light leading-relaxed">
              Unlike traditional diffusers that use heat or water to carry scent, Autivora employs
              cold-air nebulization to convert undiluted fragrance oil into a dry, nano-sized mist.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { src: img(images, 1, FALLBACKS.tech1), alt: alt(images, 1, 'Technology Detail') },
              { src: img(images, 2, FALLBACKS.tech2), alt: alt(images, 2, 'Technology Detail') },
              { src: img(images, 3, FALLBACKS.tech3), alt: alt(images, 3, 'Technology Detail') },
            ].map((image) => (
              <div key={image.src} className="aspect-square bg-neutral-50 rounded-sm overflow-hidden">
                <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4️⃣ Craftsmanship */}
      <section className="py-32 px-6 bg-neutral-50 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1 space-y-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
              Materials
            </span>
            <h2 className="text-4xl lg:text-6xl font-display font-medium tracking-tight leading-[1.1]">
              Sculpted from Metal.
            </h2>
            <p className="text-neutral-500 text-lg font-light leading-relaxed">
              Each Autivora device is machined from a single block of aerospace-grade aluminum, then
              anodized to a satin finish that complements the interiors of the world's most refined
              cabins. Its minimal cylindrical form is designed to disappear into your environment,
              leaving only its presence felt.
            </p>
          </div>
          <div className="order-1 lg:order-2 aspect-[4/5] bg-neutral-200 overflow-hidden shadow-2xl rounded-sm">
            <img
              src={img(images, 4, FALLBACKS.craft)}
              alt={alt(images, 4, 'Anodized Aluminum Detail')}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 5️⃣ Control & Performance */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center relative overflow-hidden rounded-sm">
            <img
              src={img(images, 5, FALLBACKS.perf)}
              alt={alt(images, 5, 'Performance & Quiet Operation')}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute z-10 text-center space-y-2">
              <span className="text-[40px] font-display font-light text-white">40dB</span>
              <p className="text-[10px] uppercase tracking-widest text-white/80">Silent Operation</p>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl font-display font-medium tracking-tight">
              Atmosphere, On Your Terms.
            </h2>
            <div className="space-y-8">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest">Adjustable Intensity</h4>
                <p className="text-sm text-neutral-500 font-light">
                  Fine-tune the presence of scent to match your mood, from a subtle hint to an
                  immersive environment.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest">Uninterrupted Presence</h4>
                <p className="text-sm text-neutral-500 font-light">
                  Enjoy up to 48 hours of continuous operation on a single charge, providing
                  cordless freedom for weeks of commuting.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest">The Sound of Silence</h4>
                <p className="text-sm text-neutral-500 font-light">
                  Engineered for absolute discretion, operating at whisper-quiet levels that never
                  intrude upon your music or conversation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ Lifestyle full-bleed */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <img
          src={img(images, 6, FALLBACKS.lifestyle)}
          alt={alt(images, 6, 'Luxury Vehicle Integration')}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
        />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl lg:text-7xl font-display font-bold text-white tracking-tighter">
            Designed for Motion.
          </h2>
          <p className="text-xl text-white/80 font-light leading-relaxed">
            Whether it&apos;s the focused intensity of the daily commute or the expansive freedom of a
            cross-continent grand tour, Autivora ensures your personal space is always defined by
            your signature scent.
          </p>
        </div>
      </section>

      {/* 7️⃣ Specifications */}
      <section className="py-32 px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-display font-medium mb-12 text-center tracking-tight">
          Technical Specifications
        </h2>
        <SpecsAccordion />
      </section>

      {/* 8️⃣ Final CTA */}
      <section className="py-32 px-6 bg-neutral-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-5xl lg:text-8xl font-display font-bold tracking-tighter leading-tight">
            The Atmosphere Is Yours.
          </h2>
          {firstVariantId ? (
            <UpsellModal
              variantId={firstVariantId}
              oils={oils}
              className="px-20 py-6 bg-white text-black text-[12px] font-bold uppercase tracking-[0.4em] hover:bg-neutral-200 transition-all duration-500 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
          ) : (
            <button
              disabled
              className="px-20 py-6 bg-white/20 text-white/40 text-[12px] font-bold uppercase tracking-[0.4em] rounded-sm cursor-not-allowed"
            >
              Coming Soon
            </button>
          )}
        </div>
      </section>

      <footer className="py-12 px-6 text-center border-t border-neutral-100">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300">
          Autivora — Excellence in Air
        </span>
      </footer>

    </div>
  );
}
