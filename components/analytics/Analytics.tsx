import GoogleAnalytics from './GoogleAnalytics';
import MetaPixel from './MetaPixel';
import TikTokPixel from './TikTokPixel';
import PinterestTag from './PinterestTag';

export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA4_ID;
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
