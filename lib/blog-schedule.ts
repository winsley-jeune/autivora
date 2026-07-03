// Weekly release scheduling for queued blog content. A post's `date` field
// doubles as its unlock date — `isReleased` gates BLOG_ARTICLES so nothing
// with a future date appears in the list, on the sitemap, or is reachable
// by URL. `weeklyReleaseDate` computes those dates for a queue so a whole
// wave can be scheduled without hand-editing each date.
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function weeklyReleaseDate(index: number, startDate: string): string {
  const start = new Date(`${startDate}T00:00:00Z`);
  const released = new Date(start.getTime() + index * WEEK_MS);
  return released.toISOString().slice(0, 10);
}

export function isReleased(dateStr: string, now: Date = new Date()): boolean {
  return new Date(`${dateStr}T00:00:00Z`) <= now;
}
