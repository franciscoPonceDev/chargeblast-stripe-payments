import { ImageResponse } from 'next/og';
import { currencyCode, formatAmount } from '@/lib/format';
import { ALL_PAYMENTS } from '@/lib/payments/data';
import { STATUS_LABELS } from '@/lib/payments/query';
import { BRAND_COLOR } from '@/lib/seo';

export const alt = 'Payment details';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';


export function generateStaticParams() {
  return ALL_PAYMENTS.map((p) => ({ id: p.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = ALL_PAYMENTS.find((x) => x.id === id);
  if (!p) return new Response(null, { status: 404 });
  const amount = formatAmount(p.amount, p.currency);
  const code = currencyCode(p.currency);
  const status = STATUS_LABELS[p.status];
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: BRAND_COLOR, color: '#fff', fontFamily: 'sans-serif', padding: 80 }}>
        <div style={{ display: 'flex', fontSize: 34, opacity: 0.85 }}>Payments demo</div>
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 24, fontSize: 150, fontWeight: 700 }}>
          {amount}
          <span style={{ fontSize: 44, marginLeft: 20, opacity: 0.8 }}>{code}</span>
        </div>
        <div style={{ display: 'flex', marginTop: 32 }}>
          <div style={{ display: 'flex', background: '#fff', color: BRAND_COLOR, fontSize: 40, fontWeight: 700, padding: '10px 28px', borderRadius: 40 }}>{status}</div>
        </div>
        <div style={{ display: 'flex', marginTop: 48, fontSize: 28, opacity: 0.8 }}>Demo data. Not affiliated with Stripe.</div>
      </div>
    ),
    size,
  );
}
