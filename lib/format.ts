import { format, formatDistanceStrict } from 'date-fns';
import { currencyDecimals } from '@/lib/payments/query';
import type { Currency } from '@/lib/payments/types';

const formatters = new Map<Currency, Intl.NumberFormat>();

function getFormatter(currency: Currency): Intl.NumberFormat {
  let f = formatters.get(currency);
  if (!f) {
    f = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      currencyDisplay: 'narrowSymbol',
    });
    formatters.set(currency, f);
  }
  return f;
}

export function formatAmount(amount: number, currency: Currency): string {
  const value = amount / 10 ** currencyDecimals(currency);
  const out = getFormatter(currency).format(value);
  const m = out.match(/^(\D+)(\d.*)$/);
  if (m && m[1].length > 1) return `${m[1]} ${m[2]}`;
  return out;
}

export function currencyCode(currency: Currency): string {
  return currency.toUpperCase();
}

export function formatDateTime(ms: number, now: number): string {
  const sameYear = new Date(ms).getFullYear() === new Date(now).getFullYear();
  return format(ms, sameYear ? 'MMM d, h:mm a' : 'MMM d, yyyy, h:mm a');
}

export function formatRelative(ms: number, now: number): string {
  const distance = formatDistanceStrict(ms, now);
  return ms > now ? `in ${distance}` : `${distance} ago`;
}

export function shortenId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 7)}…${id.slice(-4)}`;
}
