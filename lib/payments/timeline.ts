import type { Payment } from "./types";

export type TimelineTone = "success" | "danger" | "neutral";

export interface TimelineEvent {
  key: string;
  label: string;
  /** Secondary line, e.g. a decline reason. */
  detail?: string;
  /** Unix ms. */
  at: number;
  tone: TimelineTone;
}

const SETTLE_MS = 2_000;
const DISPUTE_DELAY_MS = 36 * 3_600_000;

/**
 * Derives a payment's event history from its fields. Pure and deterministic; `now`
 * only clamps the synthetic dispute time so it never lands in the future.
 */
export function buildTimeline(p: Payment, now: number = Number.POSITIVE_INFINITY): TimelineEvent[] {
  const settled = p.created + SETTLE_MS;
  const events: TimelineEvent[] = [{ key: "started", label: "Payment started", at: p.created, tone: "neutral" }];

  switch (p.status) {
    case "succeeded":
      events.push({ key: "succeeded", label: "Payment succeeded", at: settled, tone: "success" });
      break;
    case "refunded":
      events.push({ key: "succeeded", label: "Payment succeeded", at: settled, tone: "success" });
      events.push({ key: "refunded", label: "Payment refunded", at: p.refundedAt ?? settled, tone: "neutral" });
      break;
    case "failed":
      events.push({
        key: "failed",
        label: "Payment failed",
        detail: p.declineReason ?? undefined,
        at: settled,
        tone: "danger",
      });
      break;
    case "blocked":
      events.push({
        key: "blocked",
        label: "Blocked by Radar",
        detail: p.declineReason ?? undefined,
        at: settled,
        tone: "danger",
      });
      break;
    case "pending":
      events.push({ key: "pending", label: "Payment pending", at: settled, tone: "neutral" });
      break;
    case "canceled":
      events.push({ key: "canceled", label: "Payment canceled", at: settled, tone: "neutral" });
      break;
  }

  if (p.disputed) {
    const at = Math.max(settled, Math.min(p.created + DISPUTE_DELAY_MS, now));
    events.push({ key: "disputed", label: "Dispute opened", at, tone: "danger" });
  }

  return events.sort((a, b) => a.at - b.at);
}
