const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://autivara.com';

// Article schema for blog posts — eligible for article rich results.
export default function ArticleJsonLd({
  title,
  description,
  datePublished,
  slug,
  image,
}: {
  title: string;
  description: string;
  datePublished: string;
  slug: string;
  image?: string;
}) {
  const url = `${BASE_URL}/blog/${slug}`;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished,
    dateModified: datePublished,
    image: image ?? `${BASE_URL}/opengraph-image`,
    author: { '@type': 'Organization', name: 'Autivara Editorial Team', url: `${BASE_URL}/about` },
    publisher: {
      '@type': 'Organization',
      name: 'Autivara',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
