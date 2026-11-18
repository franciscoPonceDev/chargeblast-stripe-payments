import { describe, expect, it } from "vitest";
import { buildTimeline } from "./timeline";
import type { Payment } from "./types";

const T = Date.UTC(2026, 10, 10, 12, 0, 0);
const DAY = 86_400_000;
const base: Payment = {
  id: "pi_" + "a".repeat(24),
  amount: 5000,
  currency: "usd",
  status: "succeeded",
  disputed: false,
  method: { type: "card", brand: "visa", wallet: null, bankName: null, last4: "4242" },
  description: "Subscription update",
  customerEmail: "a@example.com",
  customerName: "A",
  created: T,
  refundedAt: null,
  declineReason: null,
};
const labels = (p: Payment) => buildTimeline(p).map((e) => e.label);

describe("buildTimeline", () => {
  it("succeeded", () => {
    const ev = buildTimeline(base);
    expect(ev.map((e) => e.label)).toEqual(["Payment started", "Payment succeeded"]);
    expect(ev[1].at).toBe(T + 2000);
  });
  it("failed carries the decline reason", () => {
    const ev = buildTimeline({ ...base, status: "failed", declineReason: "Card declined" });
    expect(ev.map((e) => e.label)).toEqual(["Payment started", "Payment failed"]);
    expect(ev[1].detail).toBe("Card declined");
  });
  it("blocked", () => {
    expect(labels({ ...base, status: "blocked", declineReason: "Highest risk" })).toEqual([
      "Payment started",
      "Blocked by Radar",
    ]);
  });
  it("refunded ends at refundedAt", () => {
    const ev = buildTimeline({ ...base, status: "refunded", refundedAt: T + DAY });
    expect(ev.map((e) => e.label)).toEqual(["Payment started", "Payment succeeded", "Payment refunded"]);
    expect(ev[2].at).toBe(T + DAY);
  });
  it("pending", () => {
    expect(labels({ ...base, status: "pending" })).toEqual(["Payment started", "Payment pending"]);
  });
  it("canceled", () => {
    expect(labels({ ...base, status: "canceled" })).toEqual(["Payment started", "Payment canceled"]);
  });
  it("disputed adds a dispute event, clamped to now", () => {
    expect(labels({ ...base, disputed: true })).toEqual(["Payment started", "Payment succeeded", "Dispute opened"]);
    const ev = buildTimeline({ ...base, disputed: true }, T + 3_600_000);
    expect(ev[2].at).toBe(T + 3_600_000);
  });
  it("events are chronological", () => {
    const ev = buildTimeline({ ...base, status: "refunded", disputed: true, refundedAt: T + 10 * DAY });
    const ats = ev.map((e) => e.at);
    expect(ats).toEqual([...ats].sort((a, b) => a - b));
  });
});
