import Link from "next/link";
import { Metadata } from "next";
import { BLOG_ARTICLES } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "The Autivara Journal — Luxury Car Fragrance Insights",
  description:
    "Expert guides on car diffuser technology, interior protection, essential oil safety, and the science of automotive fragrance.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "The Autivara Journal",
    description:
      "Expert guides on car diffuser technology, interior protection, essential oil safety, and the science of automotive fragrance.",
    url: "/blog",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function BlogIndex() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 max-w-4xl mx-auto text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-4 block">
          The Autivara Journal
        </span>
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter mb-6">
          Knowledge. Refined.
        </h1>
        <p className="text-neutral-500 text-lg font-light max-w-2xl mx-auto">
          Expert insights on car diffuser technology, interior material
          compatibility, essential oil safety, and the science behind premium
          automotive fragrance.
        </p>
      </section>

      {/* Article Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_ARTICLES.map((article, i) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className={`group block border border-gray-100 rounded-sm overflow-hidden hover:border-black transition-colors duration-300 ${
                i === 0 ? "md:col-span-2" : ""
              }`}
            >
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <span>{article.category}</span>
                  <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                  <span>{article.readTime}</span>
                </div>
                <h2
                  className={`font-display font-medium tracking-tight group-hover:text-neutral-600 transition-colors ${
                    i === 0 ? "text-3xl" : "text-xl"
                  }`}
                >
                  {article.title}
                </h2>
                <p className="text-neutral-500 text-sm font-light leading-relaxed">
                  {article.excerpt}
                </p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 group-hover:text-neutral-500 group-hover:border-neutral-500 transition-colors">
                  Read Article
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
