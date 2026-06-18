// Display the brand consistently as "Autivara" everywhere it surfaces, even if a
// data source (e.g. live Shopify product titles not yet re-imported) still reads
// "Autivora". Display-only — URL handles and image paths are untouched.
export function brandName(s: string | undefined | null): string {
  return (s ?? '').replace(/Autivora/g, 'Autivara');
}
