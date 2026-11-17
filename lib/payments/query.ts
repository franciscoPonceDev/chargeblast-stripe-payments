import { endOfDay, isValid, parseISO, startOfDay, subDays } from 'date-fns';
import type { Currency, MethodType, Payment, PaymentStatus } from './types';

export type StatusTab = 'all' | 'succeeded' | 'refunded' | 'disputed' | 'failed' | 'uncaptured';
export type DateFilter =
  | { preset: 'all' | 'today' | '7d' | '30d' }
  | { preset: 'custom'; from: string | null; to: string | null }; // 'yyyy-MM-dd'
export type AmountFilter =
  | { op: 'any' }
  | { op: 'eq' | 'gt' | 'lt'; value: number }
  | { op: 'between'; min: number; max: number }; // major units
export type SortKey = 'created' | 'amount' | 'status';
export interface SortState {
  id: SortKey;
  desc: boolean;
}
export type PageSize = 25 | 50 | 100;

export interface PaymentsQuery {
  tab: StatusTab;
  search: string;
  statuses: PaymentStatus[];
  methods: MethodType[];
  currencies: Currency[];
  date: DateFilter;
  amount: AmountFilter;
  sort: SortState[];
  page: number;
  pageSize: PageSize;
}

export const DEFAULT_QUERY: PaymentsQuery = {
  tab: 'all',
  search: '',
  statuses: [],
  methods: [],
  currencies: [],
  date: { preset: 'all' },
  amount: { op: 'any' },
  sort: [{ id: 'created', desc: true }],
  page: 0,
  pageSize: 25,
};

export interface QueryResult {
  rows: Payment[];
  total: number;
  page: number;
  pageCount: number;
}

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  succeeded: 'Succeeded',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
  canceled: 'Canceled',
  blocked: 'Blocked',
};

export function currencyDecimals(c: Currency): number {
  return c === 'jpy' ? 0 : 2;
}

function majorAmount(p: Payment): number {
  return p.amount / 10 ** currencyDecimals(p.currency);
}

function matchesTab(p: Payment, tab: StatusTab): boolean {
  switch (tab) {
    case 'all':
      return true;
    case 'disputed':
      return p.disputed === true;
    case 'uncaptured':
      return p.status === 'pending';
    default:
      return p.status === tab;
  }
}

function matchesSearch(p: Payment, raw: string): boolean {
  const s = raw.trim().toLowerCase();
  if (!s) return true;
  if (p.id.toLowerCase().includes(s)) return true;
  if (p.customerEmail.toLowerCase().includes(s)) return true;
  if (p.customerName.toLowerCase().includes(s)) return true;
  if (/^\d{1,4}$/.test(s) && p.method.last4.includes(s)) return true;
  return false;
}

function parseDay(s: string | null): Date | null {
  if (!s) return null;
  const d = parseISO(s);
  return isValid(d) ? d : null;
}

/** Returns [lo, hi] epoch ms bounds; null side = open. */
function dateBounds(f: DateFilter, now: number): [number | null, number | null] {
  switch (f.preset) {
    case 'all':
      return [null, null];
    case 'today':
      return [startOfDay(now).getTime(), null];
    case '7d':
      return [subDays(now, 7).getTime(), null];
    case '30d':
      return [subDays(now, 30).getTime(), null];
    case 'custom': {
      let from = parseDay(f.from);
      let to = parseDay(f.to);
      if (from && to && from.getTime() > to.getTime()) [from, to] = [to, from];
      return [from ? startOfDay(from).getTime() : null, to ? endOfDay(to).getTime() : null];
    }
  }
}

function matchesAmount(p: Payment, f: AmountFilter): boolean {
  if (f.op === 'any') return true;
  const v = majorAmount(p);
  // Compare at the currency's precision to avoid float noise (e.g. 9.88).
  const dec = currencyDecimals(p.currency);
  const r = (n: number) => Math.round(n * 10 ** dec);
  const minor = r(v);
  if (f.op === 'between') {
    if (Number.isNaN(f.min) || Number.isNaN(f.max)) return true;
    const lo = Math.min(f.min, f.max);
    const hi = Math.max(f.min, f.max);
    return minor >= r(lo) && minor <= r(hi);
  }
  if (Number.isNaN(f.value)) return true;
  if (!Number.isFinite(f.value)) {
    // +/-Infinity: gt/lt/eq compare naturally on the major amount.
    return f.op === 'gt' ? v > f.value : f.op === 'lt' ? v < f.value : v === f.value;
  }
  const t = r(f.value);
  return f.op === 'eq' ? minor === t : f.op === 'gt' ? minor > t : minor < t;
}

export function filterPayments(all: Payment[], q: PaymentsQuery, now: number): Payment[] {
  const [lo, hi] = dateBounds(q.date, now);
  return all.filter((p) => {
    if (!matchesTab(p, q.tab)) return false;
    if (q.statuses.length && !q.statuses.includes(p.status)) return false;
    if (q.methods.length && !q.methods.includes(p.method.type)) return false;
    if (q.currencies.length && !q.currencies.includes(p.currency)) return false;
    if (!matchesSearch(p, q.search)) return false;
    if (lo !== null && p.created < lo) return false;
    if (hi !== null && p.created > hi) return false;
    return matchesAmount(p, q.amount);
  });
}

function cmp(a: number | string, b: number | string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareBy(key: SortKey, a: Payment, b: Payment): number {
  switch (key) {
    case 'created':
      return cmp(a.created, b.created);
    case 'amount':
      return cmp(majorAmount(a), majorAmount(b));
    case 'status':
      return cmp(STATUS_LABELS[a.status], STATUS_LABELS[b.status]);
  }
}

export function sortPayments(rows: Payment[], sort: SortState[]): Payment[] {
  return [...rows].sort((a, b) => {
    for (const s of sort) {
      const c = compareBy(s.id, a, b);
      if (c !== 0) return s.desc ? -c : c;
    }
    return cmp(b.created, a.created) || cmp(a.id, b.id);
  });
}

export function applyQuery(all: Payment[], q: PaymentsQuery, now: number): QueryResult {
  const sorted = sortPayments(filterPayments(all, q, now), q.sort);
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / q.pageSize));
  const page = Math.min(Math.max(0, Math.trunc(q.page) || 0), pageCount - 1);
  const start = page * q.pageSize;
  return { rows: sorted.slice(start, start + q.pageSize), total, page, pageCount };
}

export function tabCounts(all: Payment[]): Record<StatusTab, number> {
  const counts: Record<StatusTab, number> = {
    all: all.length,
    succeeded: 0,
    refunded: 0,
    disputed: 0,
    failed: 0,
    uncaptured: 0,
  };
  for (const p of all) {
    if (p.status === 'succeeded') counts.succeeded++;
    if (p.status === 'refunded') counts.refunded++;
    if (p.status === 'failed') counts.failed++;
    if (p.status === 'pending') counts.uncaptured++;
    if (p.disputed) counts.disputed++;
  }
  return counts;
}
