import { currencyDecimals, STATUS_LABELS } from './query';
import type { Payment } from './types';

export const CSV_BOM = '﻿';
const EOL = '\r\n';

export const CSV_HEADER = [
  'id',
  'created',
  'amount',
  'currency',
  'status',
  'payment_method',
  'last4',
  'description',
  'customer_name',
  'customer_email',
  'refunded_at',
  'decline_reason',
] as const;

/** Spreadsheet apps evaluate cells that start with these as formulas; a leading quote makes them text. */
const FORMULA_START = /^[=+\-@\t\r]/;

function escapeCell(value: string): string {
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function methodLabel(m: Payment['method']): string {
  return [m.type, m.wallet, m.brand, m.bankName].filter(Boolean).join(' ');
}

function isoOrEmpty(ms: number | null): string {
  return ms === null ? '' : new Date(ms).toISOString();
}

function row(p: Payment): string {
  const decimals = currencyDecimals(p.currency);
  // Amount is numeric by construction (never starts with a formula character in practice), so it skips the guard.
  const amount = (p.amount / 10 ** decimals).toFixed(decimals);
  return [
    escapeCell(p.id),
    escapeCell(isoOrEmpty(p.created)),
    amount,
    escapeCell(p.currency.toUpperCase()),
    escapeCell(STATUS_LABELS[p.status]),
    escapeCell(methodLabel(p.method)),
    escapeCell(p.method.last4),
    escapeCell(p.description),
    escapeCell(p.customerName),
    escapeCell(p.customerEmail),
    escapeCell(isoOrEmpty(p.refundedAt)),
    escapeCell(p.declineReason ?? ''),
  ].join(',');
}

export function toCsv(rows: Payment[]): string {
  return CSV_BOM + [CSV_HEADER.join(','), ...rows.map(row)].join(EOL) + EOL;
}
