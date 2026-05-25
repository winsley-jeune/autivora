import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HOME_ROOMS, getHomeRoom } from '@/lib/seo-surfaces';
import SurfacePage from '@/components/SurfacePage';

type Props = { params: Promise<{ room: string }> };

export async function generateStaticParams() {
  return HOME_ROOMS.map((r) => ({ room: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { room } = await params;
  const entry = getHomeRoom(room);
  if (!entry) return { title: 'Home Diffuser' };
  const canonical = `/home/rooms/${room}`;
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
  const { room } = await params;
  const entry = getHomeRoom(room);
  if (!entry) notFound();

  return (
    <SurfacePage
      entry={entry}
      categoryLabel="Home"
      categoryHref="/home"
      surfaceHubLabel="Rooms"
      surfaceHubHref="/home/rooms"
    />
  );
}
