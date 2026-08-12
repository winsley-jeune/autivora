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
      // Old flagship product retired → real car hero (canonical spelling). Must precede the
      // parameterized autivora-:slug rule below or it would 301 to a nonexistent autivara-one.
      {
        source: '/product/autivora-one',
        destination: '/product/autivara-rechargeable-car-diffuser',
        permanent: true,
      },
      // Brand canonicalization (2026-08-12 ruling): the domain spelling wins — every legacy
      // autivora-* product slug 301s to its autivara-* twin. One parameterized rule covers all
      // 19 renamed handles and any future stragglers.
      {
        source: '/product/autivora-:slug',
        destination: '/product/autivara-:slug',
        permanent: true,
      },
      // ── Legacy Shopify-storefront URLs (still in Google's index) ──────────
      {
        source: '/products/puredrive-pro',
        destination: '/product/autivora-rechargeable-car-diffuser',
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
      // ── Retired premium product handles → nearest real product ────────────
      { source: '/product/autivora-drive', destination: '/product/autivora-rechargeable-car-diffuser', permanent: true },
      { source: '/product/autivora-drive-mini', destination: '/product/autivora-astronaut-car-diffuser', permanent: true },
      { source: '/product/autivora-clip', destination: '/product/autivora-magnetic-vent-diffuser', permanent: true },
      { source: '/product/autivora-home', destination: '/product/autivora-wood-grain-diffuser', permanent: true },
      { source: '/product/autivora-home-room', destination: '/product/autivora-volcano-flame-diffuser', permanent: true },
      { source: '/product/autivora-pro', destination: '/product/autivora-atmos-pro-hvac', permanent: true },
      { source: '/product/autivora-business-leather-clip', destination: '/product/autivora-atmos-wifi-diffuser', permanent: true },
      // ── Retired sections (premium-only, no real products) → live category ─
      { source: '/office/:path*', destination: '/home', permanent: true },
      { source: '/fitment/:path*', destination: '/auto', permanent: true },
      // ── Retired blog posts (tech the catalog doesn't have) → blog index ───
      { source: '/blog/whole-house-scent-diffuser-guide', destination: '/blog', permanent: true },
      { source: '/blog/waterless-vs-ultrasonic-diffuser', destination: '/blog', permanent: true },
    ];
  },
};

export default nextConfig;
