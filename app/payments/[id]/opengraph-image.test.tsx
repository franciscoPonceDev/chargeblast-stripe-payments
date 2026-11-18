import { describe, expect, it, vi } from 'vitest';

vi.mock('next/og', () => ({
  ImageResponse: class {
    constructor() {
      return new Response('png', { status: 200 });
    }
  },
}));

import Image from './opengraph-image';
import { ALL_PAYMENTS } from '@/lib/payments/data';

describe('payment opengraph-image', () => {
  it('returns 404 for an unknown id', async () => {
    const res = (await Image({ params: Promise.resolve({ id: 'pi_bogus' }) })) as Response;
    expect(res.status).toBe(404);
  });

  it('renders an image for a known id', async () => {
    const res = (await Image({ params: Promise.resolve({ id: ALL_PAYMENTS[0].id }) })) as Response;
    expect(res.status).toBe(200);
  });
});
