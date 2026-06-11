/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
      // Old flagship product retired → real car hero
      {
        source: '/product/autivora-one',
        destination: '/product/autivora-drive',
        permanent: true,
      },
      // ── Legacy Shopify-storefront URLs (still in Google's index) ──────────
      {
        source: '/products/puredrive-pro',
        destination: '/product/autivora-drive',
        permanent: true,
      },
      {
        source: '/products/:handle',
        destination: '/product/:handle',
        permanent: true,
      },
      {
        source: '/pages/contact',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/pages/:page',
        destination: '/',
        permanent: true,
      },
      {
        source: '/policies/refund-policy',
        destination: '/returns',
        permanent: true,
      },
      {
        source: '/policies/shipping-policy',
        destination: '/shipping',
        permanent: true,
      },
      {
        source: '/policies/:policy',
        destination: '/returns',
        permanent: true,
      },
      {
        source: '/collections/:path*',
        destination: '/collection',
        permanent: true,
      },
      {
        source: '/blogs/:path*',
        destination: '/blog',
        permanent: true,
      },
      // ── Retired test scents → nearest live scent ──────────────────────────
      {
        source: '/scents/savage',
        destination: '/scents/noir-oud',
        permanent: true,
      },
      {
        source: '/scents/compassion',
        destination: '/scents/citrus-bloom',
        permanent: true,
      },
      {
        source: '/scents/vanilla-macadamia',
        destination: '/scents/amber-vanilla',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
