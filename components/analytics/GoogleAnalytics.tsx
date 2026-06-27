import Script from 'next/script';

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          // Headless cross-domain: decorate links to the Shopify-hosted checkout
          // so autivara.com -> checkout.autivara.com stays ONE session (no
          // self-referral, no lost attribution). Harmless if checkout doesn't
          // yet carry the same tag.
          gtag('config', '${gaId}', {
            send_page_view: true,
            linker: { domains: ['autivara.com', 'checkout.autivara.com'] }
          });
        `}
      </Script>
    </>
  );
}
