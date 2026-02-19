'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import CartButton from '@/components/CartButton';

const NAV_LINKS = [
  { label: 'Collection', href: '/collection' },
  { label: 'Oils', href: '/collection#signature-oils' },
  { label: 'Technology', href: '/product/puredrive-pro' },
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
        Autivora
      </a>

      {/* Desktop nav */}
      <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide text-gray-500">
        {NAV_LINKS.map(({ label, href }) => (
          <a key={href} href={href} className="hover:text-black transition-colors">
            {label}
          </a>
        ))}
      </nav>

      {/* Right: cart + hamburger */}
      <div className="flex items-center gap-4">
        <CartButton />
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="md:hidden p-1 text-black"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 top-[73px] z-40 bg-white flex flex-col px-8 pt-10 pb-16 space-y-8 md:hidden">
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

          {/* Bottom strip */}
          <div className="!mt-auto border-t border-neutral-100 pt-8 space-y-3">
            <a href="/shipping" onClick={() => setOpen(false)} className="block text-xs text-neutral-400 hover:text-black transition-colors">
              Shipping Policy
            </a>
            <a href="/returns" onClick={() => setOpen(false)} className="block text-xs text-neutral-400 hover:text-black transition-colors">
              Returns & Refunds
            </a>
            <a href="/fitment" onClick={() => setOpen(false)} className="block text-xs text-neutral-400 hover:text-black transition-colors">
              Vehicle Compatibility
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
