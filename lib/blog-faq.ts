// Pulls a Q&A list out of a blog article's markdown content — the "## Frequently
// asked questions" section with `### Question` headings — for FAQPage schema.
export function extractFaq(content: string[]): { question: string; answer: string }[] {
  const out: { question: string; answer: string }[] = [];
  let inFaq = false;
  let q: string | null = null;
  let answer: string[] = [];
  const flush = () => {
    if (q && answer.length) out.push({ question: q, answer: answer.join(' ') });
    q = null;
    answer = [];
  };
  for (const block of content) {
    const t = block.trim();
    if (/^##\s+frequently asked questions/i.test(t)) {
      inFaq = true;
      continue;
    }
    if (!inFaq) continue;
    if (/^##\s/.test(t)) {
      flush();
      inFaq = false;
      continue;
    }
    if (/^###\s+/.test(t)) {
      flush();
      q = t.replace(/^###\s+/, '').trim();
      continue;
    }
    if (q) answer.push(t);
  }
  flush();
  return out;
}
