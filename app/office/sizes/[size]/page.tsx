import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OFFICE_SIZES, getOfficeSize } from '@/lib/seo-surfaces';
import SurfacePage from '@/components/SurfacePage';

type Props = { params: Promise<{ size: string }> };

export async function generateStaticParams() {
  return OFFICE_SIZES.map((s) => ({ size: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { size } = await params;
  const entry = getOfficeSize(size);
  if (!entry) return { title: 'Office Diffuser' };
  const canonical = `/office/sizes/${size}`;
  return {
    title: entry.metaTitle,
    description: entry.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: entry.metaTitle,
      description: entry.metaDescription,
      url: canonical,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: entry.metaTitle, description: entry.metaDescription },
  };
}

export default async function Page({ params }: Props) {
  const { size } = await params;
  const entry = getOfficeSize(size);
  if (!entry) notFound();

  return (
    <SurfacePage
      entry={entry}
      categoryLabel="Office"
      categoryHref="/office"
      surfaceHubLabel="Office Sizes"
      surfaceHubHref="/office/sizes"
    />
  );
}
