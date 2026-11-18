import { currencyDecimals } from "./query";
import type { Payment } from "./types";

const RATE_BPS = 290; // 2.9%
const FIXED_FEE_MINOR = 30; // 30 cents, decimal currencies only
const ZERO_DECIMAL_RATE_BPS = 360; // zero-decimal currencies (JPY): 3.6% and no fixed fee

type Priced = Pick<Payment, "amount" | "currency" | "status">;

/** Fee is only taken on money that actually moved. */
export function feeFor(p: Priced): number {
  if (p.status !== "succeeded" && p.status !== "refunded") return 0;
  if (currencyDecimals(p.currency) === 0) return Math.round((p.amount * ZERO_DECIMAL_RATE_BPS) / 10_000);
  return Math.round((p.amount * RATE_BPS) / 10_000) + FIXED_FEE_MINOR;
}

export function netFor(p: Priced): number {
  return p.amount - Math.min(feeFor(p), p.amount);
}

/** What shows on the cardholder's statement: "ACME* <DESC>" capped at 22 characters. */
export function statementDescriptor(description: string): string {
  return `ACME* ${description.toUpperCase()}`.slice(0, 22).trimEnd();
}

const PLANS = ["starter", "growth", "scale", "enterprise"] as const;

function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619) >>> 0;
  return h;
}

/** Deterministic pseudo-metadata derived from the payment id; some payments have none. */
export function metadataFor(id: string): [key: string, value: string][] {
  const h = hash(id);
  if (h % 5 === 0) return [];
  const pairs: [string, string][] = [
    ["order_id", `ord_${(h % 900_000) + 100_000}`],
    ["plan", PLANS[(h >>> 8) % PLANS.length]],
  ];
  if ((h >>> 4) % 2 === 0) pairs.push(["source", "checkout"]);
  return pairs;
}
