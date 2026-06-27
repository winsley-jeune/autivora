'use client';

import { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';
import CartButton from '@/components/CartButton';

// Categories match the homepage "Our Collections" + Shop All. /office is retired.
const NAV_LINKS = [
  { label: 'Car', href: '/auto' },
  { label: 'Home', href: '/home' },
  { label: 'Commercial', href: '/industrial' },
  { label: 'Scents', href: '/scents' },
  { label: 'Shop All', href: '/collection' },
];

const SECONDARY_LINKS = [
  { label: 'Search', href: '/search' },
  { label: 'Journal', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Shipping Policy', href: '/shipping' },
  { label: 'Returns & Refunds', href: '/returns' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="py-6 px-8 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
      {/* Logo */}
      <a
        href="/"
        className="text-xl font-display font-bold tracking-tighter uppercase hover:opacity-70 transition-opacity"
      >
        Autivara
      </a>

      {/* Desktop nav */}
      <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide text-gray-500">
        {NAV_LINKS.map(({ label, href }) => (
          <a key={href} href={href} className="hover:text-black transition-colors">
            {label}
          </a>
        ))}
      </nav>

      {/* Right: search + cart + hamburger */}
      <div className="flex items-center gap-4">
        <a
          href="/search"
          aria-label="Search"
          className="p-1 text-black hover:opacity-70 transition-opacity"
        >
          <Search size={20} />
        </a>
        <CartButton />
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="md:hidden p-1 text-black"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer — full category list, scrollable */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-[73px] z-40 bg-white flex flex-col md:hidden overflow-y-auto">
          <nav className="flex flex-col px-8 pt-10 gap-6">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="text-3xl font-display font-bold tracking-tighter text-black hover:text-neutral-400 transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="mt-auto border-t border-neutral-100 px-8 pt-8 pb-16 space-y-3">
            {SECONDARY_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block text-xs text-neutral-400 hover:text-black transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
