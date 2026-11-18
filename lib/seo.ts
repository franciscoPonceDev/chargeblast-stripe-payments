// WHY: this site mimics a Stripe dashboard, so public indexing risks phishing-classifier flags; opt in explicitly.
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
