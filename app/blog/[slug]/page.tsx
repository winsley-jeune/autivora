import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BLOG_ARTICLES } from "@/lib/blog-data";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import PuraCostCalculator from "@/components/blog/PuraCostCalculator";

type Props = {
  params: Promise<{ slug: string }>;
};

function getArticle(slug: string) {
  return BLOG_ARTICLES.find((a) => a.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article Not Found" };

  const canonical = `/blog/${slug}`;
  return {
    // metaTitle already includes the "| Autivora" brand suffix — bypass the
    // layout's "%s | Autivora" template to avoid doubling it.
    title: { absolute: article.metaTitle },
    description: article.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: canonical,
      type: "article",
      publishedTime: article.date,
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.metaDescription,
    },
  };
}

function renderBlock(block: string, index: number) {
  // Heading
  if (block.startsWith("## ")) {
    return (
      <h2
        key={index}
        className="text-2xl font-display font-medium tracking-tight mt-12 mb-4"
      >
        {block.slice(3)}
      </h2>
    );
  }
  if (block.startsWith("### ")) {
    return (
      <h3
        key={index}
        className="text-lg font-bold mt-8 mb-2"
      >
        {block.slice(4)}
      </h3>
    );
  }

  // Interactive subscription-cost calculator
  if (block.startsWith("[[calculator]]")) {
    return <PuraCostCalculator key={index} />;
  }

  // Product CTA button:  [[cta]]Label|/product/handle
  if (block.startsWith("[[cta]]")) {
    const [label, href] = block.slice(7).split("|");
    return (
      <div key={index} className="my-10">
        <Link
          href={(href ?? "#").trim()}
          className="inline-block bg-black text-white px-10 py-4 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all rounded-sm"
        >
          {(label ?? "Shop Now").trim()}
        </Link>
      </div>
    );
  }

  // Table
  if (block.startsWith("|")) {
    const rows = block.split("\n").filter((r) => r.trim());
    const headerRow = rows[0];
    const dataRows = rows.slice(2); // skip separator row
    const headers = headerRow
      .split("|")
      .filter((c) => c.trim())
      .map((c) => c.trim());

    return (
      <div key={index} className="overflow-x-auto my-8">
        <table className="w-full text-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px] text-gray-500 border-b border-gray-200"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => {
              const cells = row
                .split("|")
                .filter((c) => c.trim())
                .map((c) => c.trim());
              return (
                <tr key={ri} className="border-b border-gray-100">
                  {cells.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-gray-600">
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // Bold-start paragraph (key point)
  if (block.startsWith("**")) {
    const parts = block.split("**");
    return (
      <p key={index} className="text-gray-700 leading-relaxed mb-4">
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="text-black font-medium">
              {part}
            </strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </p>
    );
  }

  // Regular paragraph with inline bold, italic, and [text](/link)
  const formatted = block
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/)
    .map((seg, i) => {
      if (seg.startsWith("**") && seg.endsWith("**")) {
        return (
          <strong key={i} className="text-black font-medium">
            {seg.slice(2, -2)}
          </strong>
        );
      }
      if (seg.startsWith("*") && seg.endsWith("*")) {
        return <em key={i}>{seg.slice(1, -1)}</em>;
      }
      const link = seg.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        return (
          <Link
            key={i}
            href={link[2]}
            className="text-black underline underline-offset-2 decoration-neutral-300 hover:decoration-black transition-colors"
          >
            {link[1]}
          </Link>
        );
      }
      return <span key={i}>{seg}</span>;
    });

  return (
    <p key={index} className="text-gray-600 leading-relaxed mb-4">
      {formatted}
    </p>
  );
}

export default async function BlogArticle({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) notFound();

  // Find related articles (same category, or next/prev)
  const related = BLOG_ARTICLES.filter((a) => a.slug !== slug).slice(0, 2);

  return (
    <div className="bg-white min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Journal", url: "/blog" },
          { name: article.title, url: `/blog/${slug}` },
        ]}
      />
      {/* Article Header */}
      <section className="pt-32 pb-12 px-6 max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-black transition-colors mb-8 block"
        >
          &larr; The Autivora Journal
        </Link>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-6">
          <span>{article.category}</span>
          <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
          <span>{article.readTime}</span>
          <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
          <span>
            {new Date(article.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter leading-tight mb-8">
          {article.title}
        </h1>
        <p className="text-xl text-neutral-500 font-light leading-relaxed italic">
          {article.excerpt}
        </p>
      </section>

      <div className="w-16 h-[1px] bg-black mx-auto"></div>

      {/* Article Body */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        {article.content.map((block, i) => renderBlock(block, i))}
      </article>

      {/* CTA */}
      <section className="bg-neutral-900 text-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-display font-bold tracking-tight">
            Ready to Upgrade Your Cabin?
          </h2>
          <p className="text-neutral-400 font-light">
            Autivora uses cold-air nebulization to deliver pure fragrance
            without heat, water, or chemicals. Waterless. USB-C rechargeable.
            Zero residue.
          </p>
          <Link
            href="/product/autivora-rechargeable-car-diffuser"
            className="inline-block px-16 py-5 bg-white text-black text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all rounded-sm"
          >
            Shop Autivora
          </Link>
        </div>
      </section>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-20">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-400 mb-8">
            Continue Reading
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group block border border-gray-100 rounded-sm p-8 hover:border-black transition-colors"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-3">
                  {r.category}
                </div>
                <h4 className="text-lg font-display font-medium tracking-tight group-hover:text-neutral-600 transition-colors mb-2">
                  {r.title}
                </h4>
                <p className="text-sm text-neutral-500 font-light line-clamp-2">
                  {r.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
