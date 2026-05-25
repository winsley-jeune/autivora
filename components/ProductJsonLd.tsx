import { Product } from '@/lib/shopify-types';
import { getSocialProof } from '@/lib/product-social-proof';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://autivora.com';

type Props = {
  product: Product;
};

export default function ProductJsonLd({ product }: Props) {
  const proof = getSocialProof(product.handle);
  const price = product.priceRange.minVariantPrice;
  const url = `${BASE_URL}/product/${product.handle}`;

  const images = [
    product.featuredImage?.url,
    ...(product.images?.edges?.map((e) => e.node.url) ?? []),
  ].filter(Boolean) as string[];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || undefined,
    image: images,
    url,
    sku: product.handle,
    brand: {
      '@type': 'Brand',
      name: 'Autivora',
    },
    offers: {
      '@type': 'Offer',
      price: parseFloat(price.amount).toFixed(2),
      priceCurrency: price.currencyCode,
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url,
      priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        .toISOString()
        .split('T')[0],
      seller: {
        '@type': 'Organization',
        name: 'Autivora',
        url: BASE_URL,
      },
    },
    ...(proof && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: proof.rating.toString(),
        reviewCount: proof.reviewCount,
        bestRating: '5',
        worstRating: '1',
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
