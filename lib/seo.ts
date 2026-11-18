// Trade-off: noindex by default; a Stripe lookalike risks phishing-classifier flags, so indexing is opt-in.
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
