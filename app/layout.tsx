import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/cart/cart-context'
import CartDrawer from '@/components/cart/CartDrawer'
import Header from '@/components/Header'
import Analytics from '@/components/analytics/Analytics'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://autivara.com';

export const metadata: Metadata = {
  title: {
    default: 'Aroma Diffusers for Car, Home & Business | Autivara',
    template: '%s | Autivara',
  },
  description:
    'Design-led aroma diffusers for car, home & business — flame, mist & vent-clip designs. Refillable, no cartridges, made to be displayed.',
  metadataBase: new URL(BASE_URL),
  applicationName: 'Autivara',
  authors: [{ name: 'Autivara' }],
  generator: 'Next.js',
  alternates: {
    canonical: '/',
    // Single-locale store — declare en-US + x-default so the locale signal is explicit.
    languages: { 'en-US': '/', 'x-default': '/' },
  },
  openGraph: {
    siteName: 'Autivara',
    type: 'website',
    url: BASE_URL,
    title: 'Autivara — Design-Led Aroma Diffusers',
    description:
      'Design-led aroma diffusers for car, home & business — flame, mist & vent-clip designs. Refillable, no cartridges, made to be displayed.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Autivara — Design-Led Aroma Diffusers',
    description:
      'Design-led aroma diffusers for car, home & business — flame, mist & vent-clip designs. Refillable, no cartridges, made to be displayed.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      ...(process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION
        ? { 'facebook-domain-verification': process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION
        ? { 'p:domain_verify': process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_TIKTOK_SITE_VERIFICATION
        ? { 'tiktok-developers-site-verification': process.env.NEXT_PUBLIC_TIKTOK_SITE_VERIFICATION }
        : {}),
    },
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Autivara',
  url: BASE_URL,
  logo: `${BASE_URL}/icon`,
  description: 'Design-led aroma diffusers — flame-effect, mist, vent-clip, and commercial scent machines for the car, home, and business.',
  email: 'support@autivara.com',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@autivara.com',
    contactType: 'customer support',
    availableLanguage: ['en'],
  },
  // Verified brand profiles.
  sameAs: [
    'https://www.instagram.com/autivara',
    'https://www.facebook.com/autivara.shop',
    'https://www.tiktok.com/@autivarashop',
    'https://www.pinterest.com/autivara',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Autivara',
  url: BASE_URL,
  // Sitelinks Search Box eligibility — points Google at the on-site /search.
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <Analytics />
        <CartProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="border-t border-neutral-100 mt-20 bg-white">
            <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

              {/* Brand */}
              <div className="space-y-4">
                <span className="text-sm font-display font-bold tracking-tighter uppercase">
                  Autivara
                </span>
                <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-xs">
                  Design-led aroma diffusers — flame-effect, mist, vent-clip, and commercial scent
                  machines for the car, the home, and business.
                </p>
              </div>

              {/* Shop */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                  Shop
                </span>
                <ul className="space-y-3">
                  {[
                    { label: 'Car', href: '/auto' },
                    { label: 'Home', href: '/home' },
                    { label: 'Commercial', href: '/industrial' },
                    { label: 'Scents', href: '/scents' },
                    { label: 'All Products', href: '/collection' },
                    { label: 'Journal', href: '/blog' },
                  ].map(({ label, href }) => (
                    <li key={href}>
                      <a
                        href={href}
                        className="text-xs text-neutral-500 hover:text-black transition-colors font-light"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Policies */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                  Support
                </span>
                <ul className="space-y-3">
                  {[
                    { label: 'About', href: '/about' },
                    { label: 'FAQ', href: '/faq' },
                    { label: 'Shipping Policy', href: '/shipping' },
                    { label: 'Returns & Refunds', href: '/returns' },
                    { label: 'Contact Us', href: '/contact' },
                    { label: 'Privacy', href: '/privacy' },
                    { label: 'Terms', href: '/terms' },
                  ].map(({ label, href }) => (
                    <li key={href}>
                      <a
                        href={href}
                        className="text-xs text-neutral-500 hover:text-black transition-colors font-light"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-neutral-100 px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300">
                Autivara — Excellence in Air
              </span>
              <span className="text-[10px] text-neutral-300 font-light">
                &copy; {new Date().getFullYear()} Autivara. All rights reserved.
              </span>
            </div>
          </footer>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
