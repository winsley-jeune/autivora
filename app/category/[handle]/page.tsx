import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

const valid = (value:string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const titleOf = (handle:string) => handle.split('-').map((x) => x.charAt(0).toUpperCase()+x.slice(1)).join(' ');

export async function generateMetadata({params}:{params:Promise<{handle:string}>}):Promise<Metadata> {
  const {handle}=await params; if(!valid(handle)) return {};
  const title=titleOf(handle);
  return {title:`${title} | Autivara`,description:`Shop Autivara's verified ${title.toLowerCase()} collection.`,alternates:{canonical:`/category/${handle}`}};
}

export default async function DynamicCategory({params}:{params:Promise<{handle:string}>}) {
  const {handle}=await params; if(!valid(handle)) notFound(); const title=titleOf(handle);
  return <main className="min-h-screen bg-white text-black">
    <BreadcrumbJsonLd items={[{name:'Home',url:'/'},{name:title,url:`/category/${handle}`}]} />
    <section className="bg-neutral-50 px-6 py-24 text-center">
      <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-neutral-400">Verified Collection</p>
      <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">{title}</h1>
      <p className="mx-auto mt-6 max-w-2xl text-neutral-600">Products selected through demand, supplier, delivery, and margin verification.</p>
    </section>
    <ProductGrid tags={handle} eyebrow="The Collection" heading={`Shop ${title}`} emitItemList />
  </main>;
}
