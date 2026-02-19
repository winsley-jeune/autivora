import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        brand: {
          black: '#1a1a1a',
          silver: '#e5e5e5',
          offwhite: '#f9f9f9',
          accent: '#d4d4d4',
        },
      },
    },
  },
  plugins: [],
}
export default config
