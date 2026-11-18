import { describe, expect, it } from 'vitest';
import {
  currencyCode,
  formatCount,
  formatAmount,
  formatDateTime,
  formatRelative,
  shortenId,
} from '@/lib/format';

const NOW = Date.UTC(2026, 10, 17, 12, 0, 0);

describe('formatAmount', () => {
  it('formats each currency', () => {
    expect(formatAmount(988, 'usd')).toBe('$9.88');
    expect(formatAmount(1599, 'gbp')).toBe('£15.99');
    expect(formatAmount(9999, 'brl')).toBe('R$ 99.99');
    expect(formatAmount(18999, 'eur')).toBe('€189.99');
    expect(formatAmount(5000, 'jpy')).toBe('¥5,000');
    expect(formatAmount(123456, 'usd')).toBe('$1,234.56');
    expect(formatAmount(2500, 'cad')).toBe('$25.00');
  });
});

describe('formatAmount fast path vs Intl', () => {
  const CURRENCIES = ['usd', 'gbp', 'eur', 'brl', 'cad', 'jpy'] as const;
  const AMOUNTS = [0, 1, 5, 9, 10, 99, 100, 101, 999, 1000, 99999, 100000, 123456, 99999999, 123456789, 5_000_000_000];
  const intl = (amount: number, c: (typeof CURRENCIES)[number]) => {
    const value = amount / 10 ** (c === 'jpy' ? 0 : 2);
    const out = new Intl.NumberFormat('en-US', { style: 'currency', currency: c.toUpperCase(), currencyDisplay: 'narrowSymbol' }).format(value);
    const m = out.match(/^(\D+)(\d.*)$/);
    return m && m[1].length > 1 ? `${m[1]} ${m[2]}` : out;
  };
  it('matches Intl.NumberFormat', () => {
    for (const c of CURRENCIES) for (const a of AMOUNTS) expect(formatAmount(a, c), `${a} ${c}`).toBe(intl(a, c));
  });
});

describe('formatCount', () => {
  it('matches toLocaleString for whole numbers', () => {
    for (const n of [0, 7, 25, 999, 1000, 1234, 12345, 606, 1234567]) expect(formatCount(n)).toBe(n.toLocaleString('en-US'));
  });
});

describe('currencyCode', () => {
  it('uppercases', () => {
    expect(currencyCode('brl')).toBe('BRL');
  });
});

describe('formatDateTime', () => {
  it('omits year in the same year', () => {
    expect(formatDateTime(Date.UTC(2026, 7, 16, 17, 3), NOW)).toBe('Aug 16, 5:03 PM');
  });
  it('includes year in another year', () => {
    expect(formatDateTime(Date.UTC(2025, 7, 16, 17, 3), NOW)).toBe('Aug 16, 2025, 5:03 PM');
  });
});

describe('formatDateTime fast path vs date-fns', () => {
  it('matches the date-fns UTC output across year boundaries', async () => {
    const { format } = await import('date-fns');
    const { appTz } = await import('@/lib/time');
    const times = [Date.UTC(2026, 0, 1, 0, 0), Date.UTC(2026, 11, 31, 23, 59), Date.UTC(2025, 5, 9, 12, 0), Date.UTC(2026, 2, 8, 0, 5), Date.UTC(2027, 1, 28, 11, 59)];
    for (const t of times) {
      const same = new Date(t).getUTCFullYear() === new Date(NOW).getUTCFullYear();
      expect(formatDateTime(t, NOW)).toBe(format(t, same ? 'MMM d, h:mm a' : 'MMM d, yyyy, h:mm a', { in: appTz }));
    }
  });
});

describe('formatRelative', () => {
  it('formats past distances', () => {
    expect(formatRelative(NOW - 30_000, NOW)).toBe('30 seconds ago');
    expect(formatRelative(NOW - 3 * 60_000, NOW)).toBe('3 minutes ago');
    expect(formatRelative(NOW - 5 * 3_600_000, NOW)).toBe('5 hours ago');
    expect(formatRelative(NOW - 2 * 86_400_000, NOW)).toBe('2 days ago');
  });
  it('formats future', () => {
    expect(formatRelative(NOW + 3 * 60_000, NOW)).toBe('in 3 minutes');
  });
});

describe('shortenId', () => {
  it('shortens long ids', () => {
    expect(shortenId('pi_3QxABCDEFGHIJKLMNOP9f2K')).toBe('pi_3QxA…9f2K');
  });
  it('keeps short ids', () => {
    expect(shortenId('pi_abc')).toBe('pi_abc');
  });
});
