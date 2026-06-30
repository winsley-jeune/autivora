import { getProducts } from '@/lib/shopify';
import { brandName } from '@/lib/brand';
import { categoryFromTags } from '@/lib/category';

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://autivara.com';

// Refetch hourly. Google Merchant Center + Meta Commerce Manager both ingest
// this same Google-RSS feed via scheduled URL fetch.
export const revalidate = 3600;

function esc(s: string): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const products = await getProducts({}).catch(() => []);

  const items = products
    // Merchant Center requires a main image and a price.
    .filter((p) => p.featuredImage?.url && p.priceRange?.minVariantPrice?.amount)
    .map((p) => {
      const url = `${BASE}/product/${p.handle}`;
      const amount = parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2);
      const currency = p.priceRange.minVariantPrice.currencyCode;
      const availability = p.availableForSale ? 'in_stock' : 'out_of_stock';
      const title = brandName(p.title);
      const description = (p.seo?.description || p.description || title).slice(0, 4900);
      const productType = categoryFromTags(p.tags);

      // Extra images (skip the featured one; cap at 10 per spec).
      const extra = (p.images?.edges ?? [])
        .map((e) => e.node.url)
        .filter((u) => u && u !== p.featuredImage?.url)
        .slice(0, 10)
        .map((u) => `<g:additional_image_link>${esc(u)}</g:additional_image_link>`)
        .join('');

      return `<item>
<g:id>${esc(p.handle)}</g:id>
<g:title>${esc(title)}</g:title>
<g:description>${esc(description)}</g:description>
<g:link>${esc(url)}</g:link>
<g:image_link>${esc(p.featuredImage!.url)}</g:image_link>
${extra}
<g:availability>${availability}</g:availability>
<g:price>${amount} ${currency}</g:price>
<g:condition>new</g:condition>
<g:brand>Autivara</g:brand>
<g:mpn>${esc(p.handle)}</g:mpn>
<g:identifier_exists>no</g:identifier_exists>
<g:product_type>${esc(productType)}</g:product_type>
</item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>Autivara</title>
<link>${BASE}</link>
<description>Autivara — design-led aroma diffusers</description>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
