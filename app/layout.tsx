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
    default: 'Autivora | Excellence in Air — Cold-Air Diffusion for Every Space',
    template: '%s | Autivora',
  },
  description:
    'Precision cold-air nebulization across automotive, residential, workplace, and commercial spaces. One technology. Every space.',
  metadataBase: new URL(BASE_URL),
  applicationName: 'Autivora',
  authors: [{ name: 'Autivora' }],
  generator: 'Next.js',
  keywords: [
    'cold air diffuser',
    'waterless diffuser',
    'car diffuser',
    'home diffuser',
    'office diffuser',
    'commercial diffuser',
    'hotel diffuser',
    'essential oil nebulizer',
    'luxury fragrance',
    'cold-air nebulization',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    siteName: 'Autivora',
    type: 'website',
    url: BASE_URL,
    title: 'Autivora | Excellence in Air',
    description:
      'Precision cold-air nebulization across automotive, residential, workplace, and commercial spaces.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Autivora | Excellence in Air',
    description:
      'Precision cold-air nebulization across automotive, residential, workplace, and commercial spaces.',
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
  name: 'Autivora',
  url: BASE_URL,
  logo: `${BASE_URL}/icon.png`,
  description: 'Precision cold-air nebulization technology across automotive, residential, workplace, and commercial spaces. Engineered in Europe.',
  sameAs: [],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Autivora',
  url: BASE_URL,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
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
                  Autivora
                </span>
                <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-xs">
                  Precision cold-air nebulization technology for the discerning driver.
                  Engineered in Europe.
                </p>
              </div>

              {/* Shop */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                  Shop
                </span>
                <ul className="space-y-3">
                  {[
                    { label: 'Auto', href: '/auto' },
                    { label: 'Home', href: '/home' },
                    { label: 'Office', href: '/office' },
                    { label: 'Industrial', href: '/industrial' },
                    { label: 'Scents', href: '/scents' },
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
                    { label: 'Shipping Policy', href: '/shipping' },
                    { label: 'Returns & Refunds', href: '/returns' },
                    { label: 'Contact Us', href: 'mailto:support@autivara.com' },
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
                Autivora — Excellence in Air
              </span>
              <span className="text-[10px] text-neutral-300 font-light">
                &copy; {new Date().getFullYear()} Autivora. All rights reserved.
              </span>
            </div>
          </footer>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
