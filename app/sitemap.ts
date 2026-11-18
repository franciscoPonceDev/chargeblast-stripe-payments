import type { MetadataRoute } from 'next';
import { ALL_PAYMENTS } from '@/lib/payments/data';
import { allowIndexing, getSiteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  // Trade-off: empty sitemap while indexing is off, so crawlers are never pointed at a Stripe lookalike.
  if (!allowIndexing) return [];
  const base = getSiteUrl();
  return [
    { url: `${base}/payments`, changeFrequency: 'daily', priority: 0.8 },
    ...ALL_PAYMENTS.map((p) => ({
      url: `${base}/payments/${p.id}`,
      lastModified: new Date(Math.max(p.created, p.refundedAt ?? 0)),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  ];
}
