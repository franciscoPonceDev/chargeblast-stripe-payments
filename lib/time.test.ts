// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from "vitest";
import data from "@/data/payments.json";
import { formatDateTime } from "@/lib/format";
import { MOCK_NOW } from "@/lib/payments/generate";
import { applyQuery, DEFAULT_QUERY } from "@/lib/payments/query";
import type { Payment } from "@/lib/payments/types";

describe("app time zone (machine TZ = America/Los_Angeles)", () => {
  beforeAll(() => {
    process.env.TZ = "America/Los_Angeles";
  });
  it("formats in UTC", () => {
    const ms = Date.UTC(2026, 0, 1, 3, 5);
    expect(formatDateTime(ms, Date.UTC(2026, 5, 1))).toBe("Jan 1, 3:05 AM");
    expect(formatDateTime(ms, Date.UTC(2027, 5, 1))).toBe("Jan 1, 2026, 3:05 AM");
  });
  it("filters Today / custom ranges by UTC day", () => {
    const all = data as Payment[];
    const startUtc = Math.floor(MOCK_NOW / 864e5) * 864e5;
    const today = applyQuery(all, { ...DEFAULT_QUERY, date: { preset: "today" }, pageSize: 100 }, MOCK_NOW);
    expect(today.total).toBe(all.filter((p) => p.created >= startUtc).length);
    const day = new Date(MOCK_NOW).toISOString().slice(0, 10);
    const custom = applyQuery(all, { ...DEFAULT_QUERY, date: { preset: "custom", from: day, to: day }, pageSize: 100 }, MOCK_NOW);
    expect(custom.total).toBe(all.filter((p) => p.created >= startUtc && p.created < startUtc + 864e5).length);
  });
});
