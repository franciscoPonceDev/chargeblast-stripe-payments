import { isValid, parseISO } from 'date-fns';
import {
  DEFAULT_QUERY,
  STATUS_LABELS,
  type AmountFilter,
  type DateFilter,
  type PageSize,
  type PaymentsQuery,
  type SortKey,
  type SortState,
  type StatusTab,
} from './query';
import type { Currency, MethodType, PaymentStatus } from './types';

const TABS: readonly StatusTab[] = ['all', 'succeeded', 'refunded', 'disputed', 'failed', 'uncaptured'];
const STATUSES = Object.keys(STATUS_LABELS) as PaymentStatus[];
const METHODS: readonly MethodType[] = ['card', 'ach', 'wallet'];
const CURRENCIES: readonly Currency[] = ['usd', 'gbp', 'eur', 'brl', 'cad', 'jpy'];
const SORT_KEYS: readonly SortKey[] = ['created', 'amount', 'status'];
const PAGE_SIZES: readonly PageSize[] = [25, 50, 100];
const PRESETS = ['today', '7d', '30d'] as const;
const MAX_SEARCH = 200;
const MAX_PAGE = 1_000_000;

export type RawSearchParams = URLSearchParams | Record<string, string | string[] | undefined>;

const DEFAULT_SORT_STR = 'created.desc';
const sortToString = (sort: SortState[]) => sort.map((s) => `${s.id}.${s.desc ? 'desc' : 'asc'}`).join(',');

export function serializeQuery(q: PaymentsQuery): URLSearchParams {
  const sp = new URLSearchParams();
  if (q.tab !== DEFAULT_QUERY.tab) sp.set('tab', q.tab);
  if (q.search) sp.set('q', q.search);
  if (q.statuses.length) sp.set('status', q.statuses.join(','));
  if (q.methods.length) sp.set('method', q.methods.join(','));
  if (q.currencies.length) sp.set('currency', q.currencies.join(','));
  if (q.date.preset === 'custom') {
    sp.set('date', 'custom');
    if (q.date.from) sp.set('from', q.date.from);
    if (q.date.to) sp.set('to', q.date.to);
  } else if (q.date.preset !== 'all') {
    sp.set('date', q.date.preset);
  }
  const a = q.amount;
  if (a.op === 'between') {
    if (Number.isFinite(a.min) && Number.isFinite(a.max)) sp.set('amount', `between:${a.min}-${a.max}`);
  } else if (a.op !== 'any' && Number.isFinite(a.value)) {
    sp.set('amount', `${a.op}:${a.value}`);
  }
  const sort = sortToString(q.sort);
  if (sort && sort !== DEFAULT_SORT_STR) sp.set('sort', sort);
  if (q.page > 0) sp.set('page', String(Math.trunc(q.page) + 1));
  if (q.pageSize !== DEFAULT_QUERY.pageSize) sp.set('size', String(q.pageSize));
  return sp;
}

function getter(raw: RawSearchParams): (k: string) => string | undefined {
  if (raw instanceof URLSearchParams) return (k) => raw.get(k) ?? undefined;
  return (k) => {
    const v = raw[k];
    return Array.isArray(v) ? v[0] : v;
  };
}

/** Comma list of known values; unknown entries are dropped, duplicates collapsed, order kept. */
function parseList<T extends string>(v: string | undefined, allowed: readonly T[]): T[] {
  if (!v) return [];
  const out: T[] = [];
  for (const part of v.split(',')) {
    const item = part.trim().toLowerCase() as T;
    if (allowed.includes(item) && !out.includes(item)) out.push(item);
  }
  return out;
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
function parseDay(v: string | undefined): string | null {
  if (!v || !DAY.test(v)) return null;
  const d = parseISO(v);
  return isValid(d) && d.toISOString().startsWith(v) ? v : null;
}

function parseDate(get: (k: string) => string | undefined): DateFilter {
  const d = get('date');
  if ((PRESETS as readonly string[]).includes(d ?? '')) return { preset: d as (typeof PRESETS)[number] };
  if (d === 'custom') {
    const from = parseDay(get('from'));
    const to = parseDay(get('to'));
    if (from || to) return { preset: 'custom', from, to };
  }
  return DEFAULT_QUERY.date;
}

const NUM = '(\\d+(?:\\.\\d+)?)';
const SIMPLE_AMOUNT = new RegExp(`^(eq|gt|lt):${NUM}$`);
const BETWEEN_AMOUNT = new RegExp(`^between:${NUM}-${NUM}$`);
function parseAmount(v: string | undefined): AmountFilter {
  if (!v) return DEFAULT_QUERY.amount;
  const s = SIMPLE_AMOUNT.exec(v);
  if (s) {
    const value = Number(s[2]);
    if (Number.isFinite(value)) return { op: s[1] as 'eq' | 'gt' | 'lt', value };
  }
  const b = BETWEEN_AMOUNT.exec(v);
  if (b) {
    const min = Number(b[1]);
    const max = Number(b[2]);
    if (Number.isFinite(min) && Number.isFinite(max)) return { op: 'between', min, max };
  }
  return DEFAULT_QUERY.amount;
}

function parseSort(v: string | undefined): SortState[] {
  if (!v) return DEFAULT_QUERY.sort;
  const out: SortState[] = [];
  for (const part of v.split(',')) {
    const [id, dir, extra] = part.trim().toLowerCase().split('.');
    if (extra !== undefined || !SORT_KEYS.includes(id as SortKey) || (dir !== 'asc' && dir !== 'desc')) continue;
    if (!out.some((s) => s.id === id)) out.push({ id: id as SortKey, desc: dir === 'desc' });
  }
  return out.length ? out : DEFAULT_QUERY.sort;
}

// Invalid params fall back to defaults per field so a bad link never breaks the page.
/** Never throws: each invalid field falls back to its default; unknown params are ignored. */
export function parseQuery(raw: RawSearchParams): PaymentsQuery {
  const get = getter(raw);
  const tab = get('tab');
  const page = get('page');
  const size = Number(get('size'));
  return {
    tab: TABS.includes(tab as StatusTab) ? (tab as StatusTab) : DEFAULT_QUERY.tab,
    search: (get('q') ?? '').slice(0, MAX_SEARCH),
    statuses: parseList(get('status'), STATUSES),
    methods: parseList(get('method'), METHODS),
    currencies: parseList(get('currency'), CURRENCIES),
    date: parseDate(get),
    amount: parseAmount(get('amount')),
    sort: parseSort(get('sort')),
    page: page && /^\d+$/.test(page) && Number(page) >= 1 ? Math.min(Number(page), MAX_PAGE) - 1 : DEFAULT_QUERY.page,
    pageSize: PAGE_SIZES.includes(size as PageSize) ? (size as PageSize) : DEFAULT_QUERY.pageSize,
  };
}
