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
    ];
  },
};

export default nextConfig;
