// Trade-off: noindex by default; a Stripe lookalike risks phishing-classifier flags, so indexing is opt-in.
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

export const SITE_NAME = 'Payments demo';
export const SITE_DESCRIPTION =
  'Rebuild of a payments dashboard (Stripe-style) for a Chargeblast front-end assessment. Demo data only. Not affiliated with Stripe.';
export const BRAND_COLOR = '#635bff';

const FALLBACK_URL = 'https://chargeblast-stripe-payments.vercel.app';

/** Absolute site origin: explicit setting, then the Vercel production domain, then a fixed fallback. */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return FALLBACK_URL;
}
