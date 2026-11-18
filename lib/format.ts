import { format, formatDistanceStrict, getYear } from 'date-fns';
import { APP_TIME_ZONE, appTz } from '@/lib/time';
import { currencyDecimals } from '@/lib/payments/query';
import type { Currency } from '@/lib/payments/types';

// Perf: Intl.NumberFormat construction costs ~25 ms per currency on a throttled mobile CPU (about 100 ms on first render);
// the en-US narrow-symbol output is simple enough to build directly. format.test.ts checks it against Intl.
const SYMBOLS: Record<Currency, string> = { usd: '$', gbp: '£', eur: '€', brl: 'R$', cad: '$', jpy: '¥' };

export function formatAmount(amount: number, currency: Currency): string {
  const decimals = currencyDecimals(currency);
  const scale = 10 ** decimals;
  const abs = Math.round(Math.abs(amount));
  const whole = String(Math.trunc(abs / scale)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fraction = decimals ? `.${String(abs % scale).padStart(decimals, '0')}` : '';
  const symbol = SYMBOLS[currency];
  return `${amount < 0 && abs > 0 ? '-' : ''}${symbol}${symbol.length > 1 ? ' ' : ''}${whole}${fraction}`;
}

/** en-US grouping for whole numbers; avoids Number#toLocaleString, whose first call costs ~100 ms on a throttled CPU. */
export function formatCount(n: number): string {
  return String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function currencyCode(currency: Currency): string {
  return currency.toUpperCase();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Perf: date-fns + TZDate cost ~80 ms per table render on a throttled CPU; with the fixed UTC zone plain Date getters give the same text.
function formatUtc(ms: number, withYear: boolean): string {
  const d = new Date(ms);
  const hour = d.getUTCHours();
  const clock = `${hour % 12 || 12}:${String(d.getUTCMinutes()).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
  const day = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
  return withYear ? `${day}, ${d.getUTCFullYear()}, ${clock}` : `${day}, ${clock}`;
}

export function formatDateTime(ms: number, now: number): string {
  if (APP_TIME_ZONE === 'UTC') return formatUtc(ms, new Date(ms).getUTCFullYear() !== new Date(now).getUTCFullYear());
  const sameYear = getYear(ms, { in: appTz }) === getYear(now, { in: appTz });
  return format(ms, sameYear ? 'MMM d, h:mm a' : 'MMM d, yyyy, h:mm a', { in: appTz });
}

export function formatRelative(ms: number, now: number): string {
  const distance = formatDistanceStrict(ms, now);
  return ms > now ? `in ${distance}` : `${distance} ago`;
}

export function shortenId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 7)}…${id.slice(-4)}`;
}
