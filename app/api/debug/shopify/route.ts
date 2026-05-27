import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function mask(value: string | undefined): string {
  if (!value) return '<undefined>';
  if (value.length < 8) return '<too-short:' + value.length + '>';
  return value.slice(0, 4) + '...' + value.slice(-4) + ' (len=' + value.length + ')';
}

export async function GET() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const envCheck = {
    SHOPIFY_STORE_DOMAIN: mask(domain),
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: mask(token),
    NEXT_PUBLIC_BASE_URL: baseUrl ?? '<undefined>',
    domain_has_https_prefix: domain?.startsWith('https://') ?? false,
    domain_has_trailing_slash: domain?.endsWith('/') ?? false,
    token_has_quotes: token?.startsWith('"') || token?.endsWith('"') || false,
    token_has_whitespace: token !== token?.trim(),
  };

  if (!domain || !token) {
    return NextResponse.json({ envCheck, error: 'Missing env vars' }, { status: 500 });
  }

  const url = `https://${domain}/api/2024-01/graphql.json`;
  const body = JSON.stringify({
    query: '{ product(handle:"autivora-one"){ id title handle availableForSale variants(first:1){ edges{ node{ id }}}}}',
  });

  let fetchResult: Record<string, unknown> = {};
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body,
      cache: 'no-store',
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = '<not-json>: ' + text.slice(0, 200);
    }
    fetchResult = {
      url,
      status: res.status,
      statusText: res.statusText,
      headers: {
        'content-type': res.headers.get('content-type'),
        'x-request-id': res.headers.get('x-request-id'),
      },
      body: json,
    };
  } catch (e: unknown) {
    fetchResult = {
      url,
      error: e instanceof Error ? { name: e.name, message: e.message } : String(e),
    };
  }

  return NextResponse.json({ envCheck, fetchResult }, { status: 200 });
}
