import Link from 'next/link';
import growth from '@/data/collection-growth.json';

type GrowthContent = {
  heading: string;
  intro: string;
  comparison: { columns: string[]; rows: string[][] };
  chooser: { title: string; body: string; href: string }[];
  faqs: { question: string; answer: string }[];
};

export default function CollectionGrowthContent({ path }: { path: string }) {
  const content = (growth as Record<string, GrowthContent>)[path];
  if (!content) return null;
  return (
    <section className="px-6 py-20 bg-neutral-50">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight">{content.heading}</h2>
          <p className="text-neutral-600 font-light leading-relaxed">{content.intro}</p>
        </div>
        <div className="overflow-x-auto bg-white border border-neutral-200 rounded-sm">
          <table className="w-full text-left text-sm">
            <thead><tr>{content.comparison.columns.map((column) => <th key={column} className="p-4 border-b border-neutral-200 text-xs uppercase tracking-wider">{column}</th>)}</tr></thead>
            <tbody>{content.comparison.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="p-4 border-b border-neutral-100 text-neutral-600">{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {content.chooser.map((item) => <Link key={item.title} href={item.href} className="bg-white border border-neutral-200 p-6 space-y-3 hover:border-black transition-colors"><h3 className="font-medium">{item.title}</h3><p className="text-sm text-neutral-600 leading-relaxed">{item.body}</p><span className="text-xs font-bold uppercase tracking-wider">Shop this option →</span></Link>)}
        </div>
        <div className="max-w-3xl space-y-6">
          <h2 className="text-2xl font-display font-medium">Buying questions</h2>
          {content.faqs.map((item) => <div key={item.question}><h3 className="font-medium mb-2">{item.question}</h3><p className="text-sm text-neutral-600 leading-relaxed">{item.answer}</p></div>)}
        </div>
      </div>
    </section>
  );
}
