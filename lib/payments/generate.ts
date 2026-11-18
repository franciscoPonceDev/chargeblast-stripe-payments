import type {
  CardBrand,
  Currency,
  Payment,
  PaymentMethod,
  PaymentStatus,
  WalletKind,
} from './types';

// Trade-off: fixed "now" (2026-11-17T18:00Z); data, "Today" filter and tests are deterministic, but never roll forward.
export const MOCK_NOW = Date.UTC(2026, 10, 17, 18, 0, 0);

const DAY = 86_400_000;
const HOUR = 3_600_000;
const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

type Rng = () => number;

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function weighted<T>(rng: Rng, entries: ReadonlyArray<readonly [T, number]>): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [value, w] of entries) {
    r -= w;
    if (r < 0) return value;
  }
  return entries[entries.length - 1][0];
}

const FIRST_NAMES = [
  'santiago', 'laura', 'sofia', 'juan', 'maria', 'samantha', 'james', 'olivia', 'liam', 'emma',
  'noah', 'ava', 'lucas', 'mia', 'ethan', 'isabella', 'daniel', 'camila', 'matthew', 'chloe',
  'david', 'priya', 'arjun', 'hannah', 'oliver', 'amelia', 'carlos', 'lucia', 'diego', 'fatima',
  'yuki', 'kenji', 'anna', 'peter', 'sarah', 'michael', 'laura', 'thomas', 'nina', 'rafael',
];
const LAST_NAMES = [
  'laura', 'reed', 'garcia', 'smith', 'johnson', 'williams', 'brown', 'jones', 'miller', 'davis',
  'rodriguez', 'martinez', 'hernandez', 'lopez', 'wilson', 'anderson', 'taylor', 'moore', 'jackson', 'martin',
  'lee', 'perez', 'thompson', 'white', 'harris', 'clark', 'lewis', 'robinson', 'walker', 'young',
  'patel', 'nguyen', 'kim', 'silva', 'santos', 'oliveira', 'tanaka', 'sato', 'schmidt', 'muller',
];
const FREE_DOMAINS = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'hotmail.co.uk'];
const CUSTOM_DOMAINS = [
  'example.com', 'brightpath.io', 'northwind.co', 'acmeworks.com', 'kestrelhq.com', 'lumenlabs.dev',
  'oakridgepartners.com', 'tidewater.net', 'pinecrest.org', 'verdantcap.com', 'stackforge.io', 'harborlane.co',
];

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type EmailStyle = 'first.last' | 'firstlast' | 'flast' | 'firstlastNN' | 'first_last' | 'firstlastNNNN' | 'lastfirst' | 'first';

function makeCustomer(rng: Rng): { email: string; name: string } {
  const first = pick(rng, FIRST_NAMES);
  const last = pick(rng, LAST_NAMES);
  const style = weighted<EmailStyle>(rng, [
    ['first.last', 20],
    ['firstlast', 22],
    ['flast', 14],
    ['firstlastNN', 14],
    ['first_last', 8],
    ['firstlastNNNN', 6],
    ['lastfirst', 6],
    ['first', 10],
  ]);
  let local: string;
  switch (style) {
    case 'first.last': local = `${first}.${last}`; break;
    case 'firstlast': local = `${first}${last}`; break;
    case 'flast': local = `${first[0]}${last}`; break;
    case 'firstlastNN': local = `${first}${last}${int(rng, 1, 99)}`; break;
    case 'first_last': local = `${first}_${last}`; break;
    case 'firstlastNNNN': local = `${first}${last}${int(rng, 1000, 9999)}`; break;
    case 'lastfirst': local = `${last}${first}`; break;
    default: local = `${first}${rng() < 0.4 ? int(rng, 70, 99) : ''}`;
  }
  const domain = rng() < 0.7 ? pick(rng, FREE_DOMAINS) : pick(rng, CUSTOM_DOMAINS);
  return { email: `${local}@${domain}`, name: `${titleCase(first)} ${titleCase(last)}` };
}

// Typical price points in minor units (JPY: whole yen).
const PRICE_POINTS: Record<Currency, readonly number[]> = {
  usd: [988, 1999, 2198, 3499, 18999, 4900, 9900, 2900],
  gbp: [799, 1599, 1999, 2999, 14999, 4500],
  eur: [899, 1799, 2199, 3199, 16999, 4900],
  cad: [1299, 2499, 2999, 4499, 22999],
  brl: [4990, 9990, 14990, 29990, 59900, 99900],
  jpy: [1500, 2980, 4900, 9800, 19800, 49800],
};

function makeAmount(rng: Rng, currency: Currency): number {
  if (rng() < 0.7) return pick(rng, PRICE_POINTS[currency]);
  // Random tail: log-uniform between 100 and the cap.
  const max = currency === 'jpy' ? 200000 : 500000;
  const amount = Math.round(Math.exp(Math.log(100) + rng() * (Math.log(max) - Math.log(100))));
  return Math.min(max, Math.max(100, amount));
}

const BANKS = ['STRIPE TEST BANK', 'Chase', 'Bank of America', 'Wells Fargo'] as const;
const DECLINES: ReadonlyArray<readonly [string, number]> = [
  ['Insufficient funds', 34],
  ['Do not honor', 26],
  ['Card declined', 16],
  ['Transaction not allowed', 10],
  ['Expired card', 8],
  ['Incorrect CVC', 6],
];
const BLOCKS = ['Blocked by Radar', 'Highest risk level'] as const;

function makeMethod(rng: Rng): PaymentMethod {
  const type = weighted<PaymentMethod['type']>(rng, [['card', 78], ['wallet', 14], ['ach', 8]]);
  const last4 = String(int(rng, 0, 9999)).padStart(4, '0');
  if (type === 'ach') {
    return { type, brand: null, wallet: null, bankName: pick(rng, BANKS), last4 };
  }
  const brand = weighted<CardBrand>(rng, [['visa', 55], ['mastercard', 25], ['amex', 12], ['discover', 8]]);
  const wallet: WalletKind | null =
    type === 'wallet' ? weighted<WalletKind>(rng, [['apple_pay', 55], ['google_pay', 30], ['link', 15]]) : null;
  return { type, brand, wallet, bankName: null, last4 };
}

function makeId(rng: Rng, used: Set<string>): string {
  for (;;) {
    let s = 'pi_';
    for (let i = 0; i < 24; i++) s += BASE62[Math.floor(rng() * 62)];
    if (!used.has(s)) {
      used.add(s);
      return s;
    }
  }
}

function makeDescription(rng: Rng): string {
  const r = rng();
  if (r < 0.8) return 'Subscription update';
  if (r < 0.92) return 'Payment for Invoice';
  return `Order #${int(rng, 1001, 1999)}`;
}

/** Age in ms before now: exponential-ish so recent days are denser, within 90 days. */
function makeAge(rng: Rng): number {
  for (;;) {
    const age = -Math.log(1 - rng()) * 22 * DAY;
    if (age < 90 * DAY) return Math.floor(age);
  }
}

export function generatePayments(count: number, seed: number, now: number): Payment[] {
  const rng = mulberry32(seed);
  const used = new Set<string>();
  const payments: Payment[] = [];

  for (let i = 0; i < count; i++) {
    const status = weighted<PaymentStatus>(rng, [
      ['succeeded', 66], ['failed', 14], ['refunded', 7], ['pending', 6], ['canceled', 4], ['blocked', 3],
    ]);
    const method = makeMethod(rng);
    const currency: Currency =
      method.type === 'ach'
        ? 'usd'
        : weighted<Currency>(rng, [['usd', 58], ['gbp', 10], ['eur', 12], ['cad', 8], ['brl', 7], ['jpy', 5]]);

    let age = makeAge(rng);
    if (status === 'pending') age %= 3 * DAY; // pending payments are recent
    if (status === 'refunded') age = Math.max(age, HOUR); // leave room for a refund before now
    const created = now - age;

    let refundedAt: number | null = null;
    if (status === 'refunded') {
      const window = Math.min(14 * DAY, now - created);
      refundedAt = created + Math.max(1, Math.floor(rng() * window));
    }

    const customer = makeCustomer(rng);
    payments.push({
      id: makeId(rng, used),
      amount: makeAmount(rng, currency),
      currency,
      status,
      disputed: status === 'succeeded' && rng() < 0.02,
      method,
      description: makeDescription(rng),
      customerEmail: customer.email,
      customerName: customer.name,
      created,
      refundedAt,
      declineReason:
        status === 'failed' ? weighted(rng, DECLINES) : status === 'blocked' ? pick(rng, BLOCKS) : null,
    });
  }

  return payments.sort((a, b) => b.created - a.created);
}
