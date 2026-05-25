type Crumb = { name: string; url: string };

export default function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://autivora.com';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${base}${item.url}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
