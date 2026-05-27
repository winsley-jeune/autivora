import { NextRequest, NextResponse } from 'next/server';

const CANONICAL_HOST = 'autivara.com';

// Redirect any non-canonical production host (e.g., autivora-roan.vercel.app,
// www.autivara.com) to autivara.com with a 308 — preserves method, path, query,
// and consolidates SEO signal on the canonical domain.
//
// Bypassed for:
//   - autivara.com (the canonical itself)
//   - localhost / 127.0.0.1 (local dev)
//   - Preview deployments (VERCEL_ENV !== 'production') so you can still test
//     a preview at autivora-<hash>.vercel.app without it bouncing to prod
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0].toLowerCase();

  if (hostname === CANONICAL_HOST) return NextResponse.next();
  if (hostname === 'localhost' || hostname === '127.0.0.1') return NextResponse.next();
  if (process.env.VERCEL_ENV !== 'production') return NextResponse.next();

  const url = request.nextUrl.clone();
  url.host = CANONICAL_HOST;
  url.protocol = 'https:';
  url.port = '';
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    // Everything except Next.js internals, static assets, API routes
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)',
  ],
};
