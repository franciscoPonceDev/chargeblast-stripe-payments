import { describe, expect, it } from 'vitest';
import { generatePayments, MOCK_NOW } from './generate';
import type { Payment } from './types';
import {
  applyQuery,
  currencyDecimals,
  DEFAULT_QUERY,
  filterPayments,
  sortPayments,
  tabCounts,
  type PaymentsQuery,
} from './query';

let seq = 0;
function make(p: Partial<Payment> = {}): Payment {
  seq += 1;
  return {
    id: `pi_${String(seq).padStart(24, '0')}`,
    amount: 1000,
    currency: 'usd',
    status: 'succeeded',
    disputed: false,
    method: { type: 'card', brand: 'visa', wallet: null, bankName: null, last4: '0000' },
    description: 'Subscription update',
    customerEmail: 'bob@x.com',
    customerName: 'Bob Smith',
    created: Date.UTC(2026, 10, 1),
    refundedAt: null,
    declineReason: null,
    ...p,
  };
}
const q = (p: Partial<PaymentsQuery>): PaymentsQuery => ({ ...DEFAULT_QUERY, ...p });
const ids = (r: Payment[]) => r.map((x) => x.id);
const NOW = Date.UTC(2026, 10, 17, 18);

describe('currencyDecimals', () => {
  it('jpy 0, others 2', () => {
    expect(currencyDecimals('jpy')).toBe(0);
    expect(currencyDecimals('usd')).toBe(2);
  });
});

describe('filterPayments', () => {
  const a = make({ status: 'succeeded' });
  const b = make({ status: 'refunded' });
  const c = make({ status: 'failed' });
  const d = make({ status: 'succeeded', disputed: true });
  const e = make({ status: 'pending' });
  const all = [a, b, c, d, e];

  it('tabs', () => {
    expect(filterPayments(all, q({ tab: 'all' }), NOW)).toHaveLength(5);
    expect(ids(filterPayments(all, q({ tab: 'succeeded' }), NOW))).toEqual([a.id, d.id]);
    expect(ids(filterPayments(all, q({ tab: 'refunded' }), NOW))).toEqual([b.id]);
    expect(ids(filterPayments(all, q({ tab: 'failed' }), NOW))).toEqual([c.id]);
    expect(ids(filterPayments(all, q({ tab: 'disputed' }), NOW))).toEqual([d.id]);
    expect(ids(filterPayments(all, q({ tab: 'uncaptured' }), NOW))).toEqual([e.id]);
  });

  it('statuses OR', () => {
    expect(ids(filterPayments(all, q({ statuses: ['failed', 'pending'] }), NOW))).toEqual([c.id, e.id]);
  });

  it('methods OR', () => {
    const ach = make({ method: { type: 'ach', brand: null, wallet: null, bankName: 'X', last4: '1111' } });
    const w = make({ method: { type: 'wallet', brand: null, wallet: 'link', bankName: null, last4: '2222' } });
    const rows = [a, ach, w];
    expect(ids(filterPayments(rows, q({ methods: ['ach', 'wallet'] }), NOW))).toEqual([ach.id, w.id]);
  });

  it('currencies OR', () => {
    const g = make({ currency: 'gbp' });
    const j = make({ currency: 'jpy' });
    expect(ids(filterPayments([a, g, j], q({ currencies: ['gbp', 'jpy'] }), NOW))).toEqual([g.id, j.id]);
  });

  it('filters AND together', () => {
    const g = make({ currency: 'gbp', status: 'failed' });
    const h = make({ currency: 'gbp', status: 'succeeded' });
    expect(ids(filterPayments([g, h, c], q({ tab: 'failed', currencies: ['gbp'] }), NOW))).toEqual([g.id]);
  });

  describe('search', () => {
    const alice = make({ customerEmail: 'alice@x.com', customerName: 'Zed', id: 'pi_abXYZ' });
    const k = make({ method: { type: 'card', brand: 'visa', wallet: null, bankName: null, last4: '4242' } });
    const other = make({ method: { type: 'card', brand: 'visa', wallet: null, bankName: null, last4: '1234' } });
    const named = make({ customerName: 'Carol Danvers', customerEmail: 'cd@y.com' });
    const rows = [alice, k, other, named];
    it('email, trimmed, case-insensitive', () => {
      expect(ids(filterPayments(rows, q({ search: '  ALICE@' }), NOW))).toEqual([alice.id]);
    });
    it('last4', () => {
      expect(ids(filterPayments(rows, q({ search: '4242' }), NOW))).toEqual([k.id]);
    });
    it('id prefix', () => {
      expect(ids(filterPayments(rows, q({ search: 'pi_ab' }), NOW))).toEqual([alice.id]);
    });
    it('short digits match last4', () => {
      expect(ids(filterPayments(rows, q({ search: '42' }), NOW))).toEqual([k.id]);
    });
    it('digit-only queries of up to 4 chars match the end of last4', () => {
      expect(ids(filterPayments(rows, q({ search: '4242' }), NOW))).toEqual([k.id]);
      expect(ids(filterPayments(rows, q({ search: '242' }), NOW))).toEqual([k.id]);
      expect(ids(filterPayments(rows, q({ search: '424' }), NOW))).toEqual([]);
    });
    it('customer name', () => {
      expect(ids(filterPayments(rows, q({ search: 'danvers' }), NOW))).toEqual([named.id]);
    });
  });

  describe('date', () => {
    const startToday = Date.UTC(2026, 10, 17);
    const t0 = make({ created: startToday });
    const tBefore = make({ created: startToday - 1 });
    const d7in = make({ created: NOW - 7 * 86400000 });
    const d7out = make({ created: NOW - 7 * 86400000 - 1 });
    const d30in = make({ created: NOW - 30 * 86400000 });
    const d30out = make({ created: NOW - 30 * 86400000 - 1 });
    const rows = [t0, tBefore, d7in, d7out, d30in, d30out];
    it('today', () => {
      expect(ids(filterPayments(rows, q({ date: { preset: 'today' } }), NOW))).toEqual([t0.id]);
    });
    it('7d', () => {
      expect(ids(filterPayments(rows, q({ date: { preset: '7d' } }), NOW))).toEqual([t0.id, tBefore.id, d7in.id]);
    });
    it('30d', () => {
      expect(ids(filterPayments(rows, q({ date: { preset: '30d' } }), NOW))).toEqual([
        t0.id,
        tBefore.id,
        d7in.id,
        d7out.id,
        d30in.id,
      ]);
      expect(ids(filterPayments([d30out], q({ date: { preset: '30d' } }), NOW))).toEqual([]);
    });
    it('custom from only', () => {
      const x = make({ created: Date.UTC(2026, 10, 9, 23, 59) });
      const y = make({ created: Date.UTC(2026, 10, 10) });
      expect(ids(filterPayments([x, y], q({ date: { preset: 'custom', from: '2026-11-10', to: null } }), NOW))).toEqual([y.id]);
    });
    it('custom reversed equals ordered; to includes 23:59', () => {
      const x = make({ created: Date.UTC(2026, 10, 12, 23, 59) });
      const y = make({ created: Date.UTC(2026, 10, 13) });
      const z = make({ created: Date.UTC(2026, 10, 9) });
      const ordered = filterPayments([x, y, z], q({ date: { preset: 'custom', from: '2026-11-10', to: '2026-11-12' } }), NOW);
      const rev = filterPayments([x, y, z], q({ date: { preset: 'custom', from: '2026-11-12', to: '2026-11-10' } }), NOW);
      expect(ids(ordered)).toEqual([x.id]);
      expect(ids(rev)).toEqual(ids(ordered));
    });
    it('custom to only', () => {
      const x = make({ created: Date.UTC(2026, 10, 12, 23, 59) });
      const y = make({ created: Date.UTC(2026, 10, 13) });
      expect(ids(filterPayments([x, y], q({ date: { preset: 'custom', from: null, to: '2026-11-12' } }), NOW))).toEqual([x.id]);
    });
    it('invalid strings are open', () => {
      expect(filterPayments(rows, q({ date: { preset: 'custom', from: 'garbage', to: null } }), NOW)).toHaveLength(6);
    });
  });

  describe('amount', () => {
    const u988 = make({ amount: 988 });
    const jpy = make({ amount: 150000, currency: 'jpy' });
    const u999 = make({ amount: 99900 });
    const u15 = make({ amount: 1500 });
    const rows = [u988, jpy, u999, u15];
    it('eq', () => {
      expect(ids(filterPayments(rows, q({ amount: { op: 'eq', value: 9.88 } }), NOW))).toEqual([u988.id]);
    });
    it('gt', () => {
      expect(ids(filterPayments(rows, q({ amount: { op: 'gt', value: 1000 } }), NOW))).toEqual([jpy.id]);
    });
    it('lt', () => {
      expect(ids(filterPayments(rows, q({ amount: { op: 'lt', value: 10 } }), NOW))).toEqual([u988.id]);
    });
    it('between inclusive, swapped', () => {
      const e1 = make({ amount: 1000 });
      const e2 = make({ amount: 2000 });
      const e3 = make({ amount: 2001 });
      expect(ids(filterPayments([e1, e2, e3], q({ amount: { op: 'between', min: 10, max: 20 } }), NOW))).toEqual([e1.id, e2.id]);
      expect(ids(filterPayments([e1, e2, e3], q({ amount: { op: 'between', min: 20, max: 10 } }), NOW))).toEqual([e1.id, e2.id]);
    });
    it('NaN is no filter', () => {
      expect(filterPayments(rows, q({ amount: { op: 'gt', value: NaN } }), NOW)).toHaveLength(4);
    });
    it('threshold is not rounded', () => {
      const u989 = make({ amount: 989 });
      const u988 = make({ amount: 988 });
      expect(ids(filterPayments([u988, u989], q({ amount: { op: 'gt', value: 9.886 } }), NOW))).toEqual([u989.id]);
      const y1001 = make({ amount: 1001, currency: 'jpy' });
      const y1000 = make({ amount: 1000, currency: 'jpy' });
      expect(ids(filterPayments([y1000, y1001], q({ amount: { op: 'gt', value: 1000.5 } }), NOW))).toEqual([y1001.id]);
    });
    it('jpy decimals', () => {
      const y500 = make({ amount: 500, currency: 'jpy' });
      const u50000 = make({ amount: 50000 }); // 500.00 usd
      const u100000 = make({ amount: 100000 }); // 1000.00 usd
      expect(ids(filterPayments([y500, u50000], q({ amount: { op: 'eq', value: 500 } }), NOW))).toEqual([y500.id, u50000.id]);
      expect(ids(filterPayments([y500, u100000], q({ amount: { op: 'lt', value: 600 } }), NOW))).toEqual([y500.id]);
    });
  });

  it('does not mutate input', () => {
    const copy = [...all];
    filterPayments(all, q({ tab: 'failed' }), NOW);
    expect(all).toEqual(copy);
  });
});

describe('sortPayments', () => {
  it('amount by USD-normalised value, not face value', () => {
    const jpy = make({ amount: 500, currency: 'jpy' }); // ~3.35 USD
    const usd = make({ amount: 10000 }); // 100
    const usd2 = make({ amount: 99900 }); // 999
    const gbp = make({ amount: 10000, currency: 'gbp' }); // ~127 USD
    expect(ids(sortPayments([jpy, usd2, usd], [{ id: 'amount', desc: false }]))).toEqual([jpy.id, usd.id, usd2.id]);
    expect(ids(sortPayments([jpy, usd2, usd], [{ id: 'amount', desc: true }]))).toEqual([usd2.id, usd.id, jpy.id]);
    expect(ids(sortPayments([gbp, usd, usd2], [{ id: 'amount', desc: false }]))).toEqual([usd.id, gbp.id, usd2.id]);
  });
  it('status alphabetical by label', () => {
    const s = make({ status: 'succeeded' });
    const bl = make({ status: 'blocked' });
    const p = make({ status: 'pending' });
    const c = make({ status: 'canceled' });
    expect(ids(sortPayments([s, p, c, bl], [{ id: 'status', desc: false }]))).toEqual([bl.id, c.id, p.id, s.id]);
  });
  it('multi-sort', () => {
    const s1 = make({ status: 'succeeded', amount: 100 });
    const s2 = make({ status: 'succeeded', amount: 300 });
    const f1 = make({ status: 'failed', amount: 200 });
    const out = sortPayments([s1, f1, s2], [{ id: 'status', desc: false }, { id: 'amount', desc: true }]);
    expect(ids(out)).toEqual([f1.id, s2.id, s1.id]);
  });
  it('tiebreak created desc then id; no mutation', () => {
    const a = make({ created: 100 });
    const b = make({ created: 200 });
    const c = make({ created: 200 });
    const input = [a, c, b];
    const out = sortPayments(input, [{ id: 'status', desc: false }]);
    expect(ids(out)).toEqual([b.id, c.id, a.id]);
    expect(ids(input)).toEqual([a.id, c.id, b.id]);
  });
});

describe('applyQuery', () => {
  const sixty = Array.from({ length: 60 }, (_, i) => make({ created: 1_000_000 + i }));
  it('paginates', () => {
    const r = applyQuery(sixty, q({ page: 2 }), NOW);
    expect(r.pageCount).toBe(3);
    expect(r.rows).toHaveLength(10);
    expect(r.total).toBe(60);
  });
  it('clamps high page', () => {
    const r = applyQuery(sixty, q({ page: 9 }), NOW);
    expect(r.page).toBe(2);
    expect(r.rows).toHaveLength(10);
  });
  it('clamps negative page', () => {
    expect(applyQuery(sixty, q({ page: -3 }), NOW).page).toBe(0);
  });
  it('empty with high page', () => {
    expect(applyQuery([], q({ page: 3 }), NOW)).toEqual({ rows: [], total: 0, page: 0, pageCount: 1 });
  });
  it('empty', () => {
    const r = applyQuery([], DEFAULT_QUERY, NOW);
    expect(r).toEqual({ rows: [], total: 0, page: 0, pageCount: 1 });
  });
  it('generated data', () => {
    const data = generatePayments(600, 42, MOCK_NOW);
    const r = applyQuery(data, DEFAULT_QUERY, MOCK_NOW);
    expect(r.total).toBe(600);
    expect(r.pageCount).toBe(24);
    expect(r.rows).toHaveLength(25);
    expect(r.rows[0].created).toBe(Math.max(...data.map((p) => p.created)));
  });
});

describe('tabCounts', () => {
  it('sums', () => {
    const rows = [
      make({ status: 'succeeded' }),
      make({ status: 'succeeded', disputed: true }),
      make({ status: 'refunded' }),
      make({ status: 'failed' }),
      make({ status: 'pending' }),
      make({ status: 'canceled' }),
    ];
    expect(tabCounts(rows)).toEqual({ all: 6, succeeded: 2, refunded: 1, disputed: 1, failed: 1, uncaptured: 1 });
  });
});
