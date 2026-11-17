import { describe, expect, it } from 'vitest';
import {
  currencyCode,
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
