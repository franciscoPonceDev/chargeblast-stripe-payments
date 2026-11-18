import { describe, expect, it } from "vitest";
import { feeFor, metadataFor, netFor, statementDescriptor } from "./details";

describe("fees", () => {
  it("is 2.9% + 30c for decimal currencies", () => {
    const p = { amount: 10_000, currency: "usd", status: "succeeded" } as const;
    expect(feeFor(p)).toBe(320);
    expect(netFor(p)).toBe(9_680);
  });
  it("has no fixed fee for JPY (whole yen)", () => {
    const p = { amount: 5_000, currency: "jpy", status: "succeeded" } as const;
    expect(feeFor(p)).toBe(180);
    expect(netFor(p)).toBe(4_820);
  });
  it("still charges a fee on refunded payments", () => {
    expect(feeFor({ amount: 10_000, currency: "usd", status: "refunded" })).toBe(320);
  });
  it("never makes net negative", () => {
    expect(netFor({ amount: 10, currency: "usd", status: "succeeded" })).toBe(0);
  });
  it("charges nothing when no money moved", () => {
    expect(feeFor({ amount: 10_000, currency: "usd", status: "failed" })).toBe(0);
    expect(netFor({ amount: 10_000, currency: "usd", status: "pending" })).toBe(10_000);
  });
});

describe("statementDescriptor", () => {
  it("prefixes, uppercases and truncates to 22 chars", () => {
    expect(statementDescriptor("Subscription update")).toBe("ACME* SUBSCRIPTION UPD");
    expect(statementDescriptor("Pro")).toBe("ACME* PRO");
    expect(statementDescriptor("x".repeat(50))).toHaveLength(22);
  });
});

describe("metadataFor", () => {
  it("is deterministic", () => {
    expect(metadataFor("pi_abc")).toEqual(metadataFor("pi_abc"));
  });
  it("yields both populated and empty results across ids", () => {
    const all = Array.from({ length: 50 }, (_, i) => metadataFor(`pi_${i}`));
    expect(all.some((m) => m.length === 0)).toBe(true);
    expect(all.some((m) => m.some(([k]) => k === "order_id"))).toBe(true);
  });
});
