import { ImageResponse } from 'next/og';

export const alt = 'Autivara — Waterless Cold-Air Fragrance Diffusion';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
          }}
        >
          Autivara
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 30,
            fontWeight: 400,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#a3a3a3',
          }}
        >
          Waterless · Heat-Free · Cold-Air Diffusion
        </div>
        <div
          style={{
            marginTop: 56,
            width: 80,
            height: 2,
            background: '#525252',
          }}
        />
        <div
          style={{
            marginTop: 32,
            fontSize: 22,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#737373',
          }}
        >
          autivara.com
        </div>
      </div>
    ),
    size,
  );
}
