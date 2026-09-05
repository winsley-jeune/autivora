import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProduct, getUpsellProducts } from '@/lib/shopify';
import { Image as ShopifyImage } from '@/lib/shopify-types';
import { SIGNATURE_OILS, type OilCard } from '@/lib/upsell-products';
import UpsellModal from '@/components/UpsellModal';
import ProductJsonLd from '@/components/ProductJsonLd';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import ProductViewTracker from '@/components/analytics/ProductViewTracker';
import ProductGallery from '@/components/ProductGallery';
import ProductGrid from '@/components/ProductGrid';
import CategoryFaq from '@/components/CategoryFaq';
import { categoryFromTags, isOil } from '@/lib/category';
import { brandName } from '@/lib/brand';
import { productFaq } from '@/lib/product-faq';

type Props = {
  params: Promise<{ handle: string }>;
};

// Live Shopify products without real photography/copy yet — e.g. new refill
// scents queued for the oil-subscription launch. Page stays functional, just
// kept out of search until real content ships. Remove the handle once ready.
const NOT_YET_INDEXABLE = new Set(['vanilla-macadamia']);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};
  const title = brandName(product.seo?.title ?? product.title);
  const description =
    product.seo?.description ||
    product.description ||
    'Compare this Autivara diffuser’s format, controls, price, and product-specific features.';
  const canonical = `/product/${handle}`;
  const ogImage = product.featuredImage?.url;
  return {
    title,
    description,
    alternates: { canonical },
    robots: NOT_YET_INDEXABLE.has(handle) ? { index: false, follow: false } : undefined,
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
  const faqItems = productFaq(product);

  // Recommendations: other products from the same collection.
  const COLLECTION_TAGS = ['car-diffusers', 'home-diffusers', 'industrial-scenting', 'smart-home-atmosphere'];
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

  const firstVariant = product.variants?.edges?.find(({ node }) => node.availableForSale)?.node ?? null;
  const firstVariantId = firstVariant?.id ?? null;

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
      <section className="pt-16 md:pt-24 pb-20 px-5 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: image gallery — main + clickable thumbnails */}
          <ProductGallery images={images} title={displayTitle} />

          {/* Right: info */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
                {category}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tighter leading-[0.95]">
                {displayTitle}
              </h1>
            </div>

            {product.descriptionHtml && (
              <div
                className="max-w-xl space-y-4 text-base text-neutral-600 font-light leading-relaxed [&_p]:mb-4 [&_strong]:font-medium [&_strong]:text-black [&_ul]:my-5 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-5 [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_a]:underline [&_a]:underline-offset-2"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 max-w-xl">
                <span className="text-2xl font-light tracking-tight text-neutral-900">{price}</span>
                <span className={`text-xs font-medium ${product.availableForSale ? 'text-emerald-700' : 'text-neutral-500'}`}>
                  {product.availableForSale ? 'Available to order' : 'Unavailable'}
                </span>
              </div>

              <div className="flex flex-col space-y-6">
                {firstVariantId ? (
                  <UpsellModal variantId={firstVariantId} oils={oils} />
                ) : (
                  <button
                    disabled
                    className="w-full lg:w-max px-16 py-5 bg-neutral-200 text-neutral-400 text-[11px] font-bold uppercase tracking-[0.3em] rounded-sm cursor-not-allowed"
                  >
                    Unavailable
                  </button>
                )}
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-500">
                  <Link href="/shipping" className="underline underline-offset-4 hover:text-black">Shipping information</Link>
                  <Link href="/returns" className="underline underline-offset-4 hover:text-black">Returns &amp; refunds</Link>
                  <Link href="/contact" className="underline underline-offset-4 hover:text-black">Ask a product question</Link>
                </div>
              </div>
            </div>
          </div>
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

      {/* Product FAQ — visible + FAQPage schema */}
      <CategoryFaq heading="Questions about this diffuser" items={faqItems} />

      {/* Final purchase CTA */}
      <section className="py-32 px-6 bg-neutral-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-4xl lg:text-6xl font-display font-bold tracking-tighter leading-tight">
            Ready to add this diffuser to your space?
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
              Unavailable
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
