import { ImageResponse } from 'next/og';
import { BRAND_COLOR } from '@/lib/seo';

export const alt = 'Payments demo, a Next.js rebuild for a Chargeblast assessment';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  const rows = [0.9, 0.7, 0.8, 0.6];
  // Trade-off: system fonts only; avoids a remote font fetch at build time at the cost of exact typography.
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: BRAND_COLOR, color: '#fff', fontFamily: 'sans-serif', padding: 72, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 560 }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>Payments demo</div>
          <div style={{ display: 'flex', fontSize: 34, marginTop: 24, opacity: 0.9 }}>Next.js rebuild · Chargeblast assessment</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', width: 420, background: '#fff', borderRadius: 24, padding: 28 }}>
          <div style={{ display: 'flex', height: 22, width: '100%', background: '#d4dee9', borderRadius: 6, marginBottom: 22 }} />
          {rows.map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', height: 18, width: `${w * 60}%`, background: '#ecf1f6', borderRadius: 6 }} />
              <div style={{ display: 'flex', height: 18, width: 70, marginLeft: 'auto', background: i % 2 ? '#ffc2dc' : '#a8f170', borderRadius: 9 }} />
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
