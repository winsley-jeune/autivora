import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://autivara.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Shopify system/functional URLs and CDN-hosted theme assets — never
        // useful in search, and CDN JS files were getting crawled directly,
        // producing junk "discovered" entries in GSC (e.g. /cdn/shop/t/1/...).
        // /fitment/* is deliberately NOT disallowed here — those 301 to /auto
        // and need to stay crawlable so Google can process the redirect.
        disallow: [
          '/api/',
          '/_next/',
          '/cart',
          '/account',
          '/search',
          '/customer_authentication/',
          '/cdn/shop/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
