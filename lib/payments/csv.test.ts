import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';
import type { Payment } from './types';

const base: Payment = {
  id: 'pi_abc',
  amount: 123456,
  currency: 'usd',
  status: 'succeeded',
  disputed: false,
  method: { type: 'card', brand: 'visa', wallet: null, bankName: null, last4: '4242' },
  description: 'Subscription update',
  customerEmail: 'a@example.com',
  customerName: 'Ada Lovelace',
  created: Date.UTC(2026, 10, 17, 18, 5, 9),
  refundedAt: null,
  declineReason: null,
};
const lines = (csv: string) => csv.slice(1).split('\r\n');

describe('toCsv', () => {
  it('starts with a UTF-8 BOM and a header row, with CRLF endings', () => {
    const csv = toCsv([base]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(lines(csv)[0]).toBe(
      'id,created,amount,currency,status,payment_method,last4,description,customer_name,customer_email,refunded_at,decline_reason',
    );
    expect(csv.endsWith('\r\n')).toBe(true);
    expect(csv.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  });

  it('writes a header-only file for no rows', () => {
    expect(lines(toCsv([]))).toHaveLength(2);
  });

  it('formats a row: ISO UTC date, major-unit amount, upper currency, status label, method', () => {
    expect(lines(toCsv([base]))[1]).toBe(
      'pi_abc,2026-11-17T18:05:09.000Z,1234.56,USD,Succeeded,card visa,4242,Subscription update,Ada Lovelace,a@example.com,,',
    );
  });

  it('uses 0 decimals for JPY and 2 otherwise', () => {
    const jpy = lines(toCsv([{ ...base, currency: 'jpy', amount: 5000 }]))[1].split(',');
    expect(jpy[2]).toBe('5000');
    const eur = lines(toCsv([{ ...base, currency: 'eur', amount: 5 }]))[1].split(',');
    expect(eur[2]).toBe('0.05');
  });

  it('describes wallet and bank methods and fills refunded_at and decline_reason', () => {
    const wallet = { ...base.method, type: 'wallet' as const, wallet: 'apple_pay' as const };
    expect(lines(toCsv([{ ...base, method: wallet }]))[1]).toContain(',wallet apple_pay visa,');
    const ach = { type: 'ach' as const, brand: null, wallet: null, bankName: 'Chase', last4: '6789' };
    expect(lines(toCsv([{ ...base, method: ach }]))[1]).toContain(',ach Chase,6789,');
    const row = lines(
      toCsv([{ ...base, status: 'failed', refundedAt: Date.UTC(2026, 0, 2), declineReason: 'card_declined' }]),
    )[1];
    expect(row).toContain(',2026-01-02T00:00:00.000Z,card_declined');
  });

  it('quotes fields with commas, quotes and newlines, doubling embedded quotes', () => {
    const csv = toCsv([{ ...base, description: 'Plan, "Pro"\nannual', customerName: 'Line\r\nBreak' }]);
    expect(csv).toContain('"Plan, ""Pro""\nannual"');
    expect(csv).toContain('"Line\r\nBreak"');
  });

  it('leaves plain fields unquoted', () => {
    expect(lines(toCsv([base]))[1]).not.toContain('"');
  });

  it.each(['=SUM(A1)', '+1', '-1', '@cmd', '\tx', '\rx'])('neutralises a formula-looking cell %j', (value) => {
    const csv = toCsv([{ ...base, description: value }]);
    const cell = `'${value}`;
    expect(csv.includes(`,${cell},`) || csv.includes(`,"${cell}",`)).toBe(true);
  });

  it('does not guard the numeric amount column', () => {
    expect(lines(toCsv([{ ...base, amount: -250 }]))[1].split(',')[2]).toBe('-2.50');
  });

  it('does not touch cells that merely contain formula characters', () => {
    expect(lines(toCsv([{ ...base, description: 'a=b' }]))[1]).toContain(',a=b,');
  });
});
