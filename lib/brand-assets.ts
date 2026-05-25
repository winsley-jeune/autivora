export const BRAND_COLORS: Record<string, string> = {
  porsche: '#b12929', // Guards Red-ish
  'mercedes-benz': '#cccccc', // Silver
  bmw: '#0066b1', // Bavarian Blue
  audi: '#bb0a30', // Audi Sport Red
  lexus: '#333333', // Dark Grey
  'land-rover': '#004d26', // British Racing Green-ish
  ferrari: '#ff2800', // Rosso Corsa
  lamborghini: '#ffbf00', // Giallo Orion
  bentley: '#0e2f44', // Dark Sapphire
  'aston-martin': '#004225', // Racing Green
  'rolls-royce': '#1c1c1c', // Spirit of Ecstasy Black
  maserati: '#003366', // Blu Nobile
  genesis: '#8b6f47', // Copper Crest
  cadillac: '#a71930', // Cadillac Red
  tesla: '#cc0000', // Tesla Red
  volvo: '#003057', // Volvo Navy
  jaguar: '#1a472a', // British Racing Green
};

export function getBrandColor(brand: string): string {
  return BRAND_COLORS[brand.toLowerCase()] || '#1a1a1a';
}

export function getBrandSVG(brand: string, model: string): string {
  const color = getBrandColor(brand);
  const initials = brand.slice(0, 2).toUpperCase();
  
  const svg = `
    <svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${brand}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.05" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="#f9f9f9" />
      <rect width="800" height="600" fill="url(#grad-${brand})" />
      
      <!-- Abstract Car Silhouette Line -->
      <path d="M 200 400 Q 400 350 600 400" stroke="${color}" stroke-width="2" fill="none" opacity="0.3" />
      
      <!-- Brand Initials as Watermark -->
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="120" fill="${color}" opacity="0.1" letter-spacing="10">
        ${initials}
      </text>
      
      <!-- Model Name -->
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#333" letter-spacing="4" font-weight="300" text-transform="uppercase">
        ${model}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
