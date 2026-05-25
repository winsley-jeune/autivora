import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { INDUSTRIAL_USE_CASES, getIndustrialUseCase } from '@/lib/seo-surfaces';
import SurfacePage from '@/components/SurfacePage';

type Props = { params: Promise<{ type: string }> };

export async function generateStaticParams() {
  return INDUSTRIAL_USE_CASES.map((u) => ({ type: u.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const entry = getIndustrialUseCase(type);
  if (!entry) return { title: 'Industrial Diffuser' };
  const canonical = `/industrial/use-cases/${type}`;
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
  const { type } = await params;
  const entry = getIndustrialUseCase(type);
  if (!entry) notFound();

  return (
    <SurfacePage
      entry={entry}
      categoryLabel="Industrial"
      categoryHref="/industrial"
      surfaceHubLabel="Use Cases"
      surfaceHubHref="/industrial/use-cases"
    />
  );
}
