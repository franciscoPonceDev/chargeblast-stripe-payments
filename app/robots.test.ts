import { afterEach, describe, expect, it, vi } from 'vitest';

async function load() {
  vi.resetModules();
  return (await import('./robots')).default;
}

describe('robots', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('disallows everything by default', async () => {
    vi.stubEnv('NEXT_PUBLIC_ALLOW_INDEXING', '');
    const robots = await load();
    expect(robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } });
  });

  it('allows when the flag is true', async () => {
    vi.stubEnv('NEXT_PUBLIC_ALLOW_INDEXING', 'true');
    const robots = await load();
    expect(robots()).toEqual({ rules: { userAgent: '*', allow: '/' } });
  });
});
