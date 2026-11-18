import { afterEach, describe, expect, it, vi } from 'vitest';

async function load() {
  vi.resetModules();
  return (await import('./sitemap')).default;
}

describe('sitemap', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('is empty while indexing is blocked', async () => {
    vi.stubEnv('NEXT_PUBLIC_ALLOW_INDEXING', '');
    expect((await load())()).toEqual([]);
  });

  it('lists payments and every detail page when allowed', async () => {
    vi.stubEnv('NEXT_PUBLIC_ALLOW_INDEXING', 'true');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.test/');
    const entries = (await load())();
    expect(entries).toHaveLength(601);
    expect(entries[0].url).toBe("https://example.test/payments");
    expect(entries[1].url).toMatch(/^https:\/\/example\.test\/payments\/pi_/);
    expect(entries[1].lastModified).toBeInstanceOf(Date);
    expect((entries[1].lastModified as Date).getFullYear()).toBeGreaterThan(2000);
    expect(entries.map((e) => e.url)).not.toContain("https://example.test/");
  });
});
