import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getUpsellProducts } from '@/lib/shopify';
import { Image as ShopifyImage } from '@/lib/shopify-types';
import { SIGNATURE_OILS, type OilCard } from '@/lib/upsell-products';
import UpsellModal from '@/components/UpsellModal';
import ProductJsonLd from '@/components/ProductJsonLd';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import ProductViewTracker from '@/components/analytics/ProductViewTracker';
import ProductGallery from '@/components/ProductGallery';
import ProductGrid from '@/components/ProductGrid';
import { categoryFromTags, isOil } from '@/lib/category';
import { brandName } from '@/lib/brand';

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};
  const title = brandName(product.seo?.title ?? product.title);
  const description =
    product.seo?.description ||
    product.description ||
    'Cold-air, waterless diffusion of pure fragrance — no heat, no water, no dilution.';
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

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;

  const product = await getProduct(handle);
  if (!product) notFound();

  const category = categoryFromTags(product.tags);
  const oilProduct = isOil(product.tags);
  const displayTitle = brandName(product.title);

  // Recommendations: other products from the same collection.
  const COLLECTION_TAGS = ['car-diffusers', 'home-diffusers', 'industrial-scenting'];
  const collectionTag = product.tags?.find((t: string) => COLLECTION_TAGS.includes(t)) ?? null;

  // Upsell oils (refills) — fetched from Shopify; shown in the add-to-cart modal.
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
        : '',
      image: live?.featuredImage?.url,
    };
  }).filter((o) => o.variantId); // only show oils that are actually purchasable

  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.priceRange.minVariantPrice.currencyCode,
  }).format(parseFloat(product.priceRange.minVariantPrice.amount));

  const firstVariantId = product.variants?.edges?.[0]?.node?.id ?? null;

  // Real Shopify images only — featured first, then gallery (deduped). No stock fallbacks.
  const seen = new Set<string>();
  const images: ShopifyImage[] = [];
  for (const i of [
    product.featuredImage,
    ...(product.images?.edges?.map((e) => e.node) ?? []),
  ]) {
    if (i && !seen.has(i.url)) { seen.add(i.url); images.push(i); }
  }
  // Main image + thumbnail swapping handled by <ProductGallery>.

  return (
    <div className="bg-white text-black min-h-screen selection:bg-black selection:text-white">
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Shop', url: '/collection' },
          { name: displayTitle, url: `/product/${handle}` },
        ]}
      />
      <ProductViewTracker
        id={product.id}
        name={displayTitle}
        price={parseFloat(product.priceRange.minVariantPrice.amount)}
        currency={product.priceRange.minVariantPrice.currencyCode}
        category={category}
      />

      {/* 1️⃣ Hero */}
      <section className="pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: image gallery — main + clickable thumbnails */}
          <ProductGallery images={images} title={displayTitle} />

          {/* Right: info */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
                {category}
              </span>
              <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tighter leading-[0.9]">
                {displayTitle}
              </h1>
              <p className="text-xl lg:text-2xl font-display italic text-neutral-400 tracking-tight">
                Scent. Without Compromise.
              </p>
            </div>

            <p className="text-neutral-500 text-lg font-light leading-relaxed max-w-md">
              {product.description ||
                'Autivara pairs a real fragrance oil with a design you will want on display — refillable, easy to live with, and made to set the mood.'}
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2️⃣ Trust strip — brand-universal, true for every product */}
      <section className="border-y border-neutral-100 py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 text-center flex-1">
            Refillable Oils
          </span>
          <div className="hidden md:block w-[1px] h-4 bg-neutral-100" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 text-center flex-1">
            No Cartridges · No Waste
          </span>
          <div className="hidden md:block w-[1px] h-4 bg-neutral-100" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 text-center flex-1">
            Designed to Display
          </span>
        </div>
      </section>

      {/* 3️⃣ Brand ethos — true across the whole line */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl lg:text-5xl font-display font-medium tracking-tight">
            Made to be seen.
          </h2>
          <p className="text-neutral-500 text-lg font-light leading-relaxed">
            {oilProduct
              ? 'A real fragrance oil, refillable into any Autivara diffuser — change your scent as often as your mood.'
              : 'Every Autivara diffuser pairs a real fragrance oil with a design built to be displayed — refill it in seconds and change the mood whenever you like.'}
          </p>
        </div>
      </section>

      {/* Recommendations — more from the same collection */}
      {collectionTag && (
        <ProductGrid
          tags={collectionTag}
          exclude={handle}
          limit={3}
          eyebrow="More from the collection"
          heading="You May Also Like"
        />
      )}

      {/* Scent cross-sell — refill oils, shown on device pages (renders only if oils are live) */}
      {!oilProduct && (
        <ProductGrid
          tags="fragrance-oil"
          limit={4}
          eyebrow="Refill it"
          heading="Pairs Well With These Scents"
        />
      )}

      {/* 5️⃣ Final CTA */}
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
          Autivara — Excellence in Air
        </span>
      </footer>
    </div>
  );
}
