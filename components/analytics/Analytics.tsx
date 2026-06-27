import GoogleAnalytics from './GoogleAnalytics';
import MetaPixel from './MetaPixel';
import TikTokPixel from './TikTokPixel';
import PinterestTag from './PinterestTag';

export default function Analytics() {
  // GA4 Measurement IDs are public (rendered into every page anyway), so we
  // default to the live property and let an env var override it if ever needed.
  const gaId = process.env.NEXT_PUBLIC_GA4_ID ?? 'G-8H0ER2NF1Y';
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const pinterestTagId = process.env.NEXT_PUBLIC_PINTEREST_TAG_ID;

  return (
    <>
      {gaId && <GoogleAnalytics gaId={gaId} />}
      {metaPixelId && <MetaPixel pixelId={metaPixelId} />}
      {tiktokPixelId && <TikTokPixel pixelId={tiktokPixelId} />}
      {pinterestTagId && <PinterestTag tagId={pinterestTagId} />}
    </>
  );
}
