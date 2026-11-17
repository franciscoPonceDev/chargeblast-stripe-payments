import { describe, expect, it } from 'vitest';
import { generatePayments, MOCK_NOW } from './generate';
import type { Currency, PaymentStatus } from './types';

const NOW = MOCK_NOW;
const DAY = 86_400_000;
const rows = generatePayments(600, 42, NOW);

describe('generatePayments', () => {
  it('is deterministic with unique, well-formed ids', () => {
    expect(rows).toHaveLength(600);
    expect(generatePayments(600, 42, NOW)).toEqual(rows);
    expect(new Set(rows.map((r) => r.id)).size).toBe(600);
    for (const r of rows) expect(r.id).toMatch(/^pi_[A-Za-z0-9]{24}$/);
  });

  it('covers all currencies and statuses with mostly succeeded', () => {
    const cur: Currency[] = ['usd', 'gbp', 'eur', 'brl', 'cad', 'jpy'];
    const st: PaymentStatus[] = ['succeeded', 'pending', 'failed', 'refunded', 'canceled', 'blocked'];
    for (const c of cur) expect(rows.some((r) => r.currency === c)).toBe(true);
    for (const s of st) expect(rows.some((r) => r.status === s)).toBe(true);
    expect(rows.filter((r) => r.status === 'succeeded').length / 600).toBeGreaterThanOrEqual(0.6);
  });

  it('has created times in range, sorted desc, with rows today', () => {
    for (const r of rows) {
      expect(r.created).toBeGreaterThanOrEqual(NOW - 90 * DAY);
      expect(r.created).toBeLessThanOrEqual(NOW);
    }
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].created).toBeGreaterThanOrEqual(rows[i].created);
    const today = new Date(NOW).toISOString().slice(0, 10);
    expect(rows.filter((r) => new Date(r.created).toISOString().slice(0, 10) === today).length).toBeGreaterThanOrEqual(5);
  });

  it('keeps refund and decline invariants', () => {
    for (const r of rows) {
      expect(r.refundedAt !== null).toBe(r.status === 'refunded');
      if (r.refundedAt !== null) expect(r.refundedAt).toBeGreaterThan(r.created);
      expect(r.declineReason !== null).toBe(r.status === 'failed' || r.status === 'blocked');
    }
  });

  it('keeps method invariants', () => {
    for (const r of rows) {
      expect(r.method.last4).toMatch(/^\d{4}$/);
      if (r.method.type === 'card') expect(r.method.brand).not.toBeNull();
      if (r.method.type === 'wallet') {
        expect(r.method.wallet).not.toBeNull();
        expect(r.method.brand).not.toBeNull();
      }
      if (r.method.type === 'ach') {
        expect(r.method.bankName).not.toBeNull();
        expect(r.currency).toBe('usd');
      }
    }
  });

  it('keeps amounts in range', () => {
    for (const r of rows) {
      const max = r.currency === 'jpy' ? 200000 : 500000;
      expect(r.amount).toBeGreaterThanOrEqual(100);
      expect(r.amount).toBeLessThanOrEqual(max);
      expect(Number.isInteger(r.amount)).toBe(true);
    }
  });
});
