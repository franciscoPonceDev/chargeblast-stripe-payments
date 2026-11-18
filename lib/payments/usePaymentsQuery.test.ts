import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import data from "@/data/payments.json";
import { MOCK_NOW } from "./generate";
import { applyQuery, DEFAULT_QUERY, tabCounts } from "./query";
import type { Payment } from "./types";
import { usePaymentsQuery } from "./usePaymentsQuery";

const ALL = data as Payment[];
const setup = () => renderHook(() => usePaymentsQuery(ALL, MOCK_NOW));

describe("usePaymentsQuery", () => {
  it("resets page on filter change", () => {
    const { result } = setup();
    act(() => result.current.setPage(3));
    expect(result.current.query.page).toBe(3);
    act(() => result.current.update({ statuses: ["failed"] }));
    expect(result.current.query.page).toBe(0);
  });
  it("setPage keeps filters", () => {
    const { result } = setup();
    act(() => result.current.update({ statuses: ["failed"] }));
    act(() => result.current.setPage(1));
    expect(result.current.query.statuses).toEqual(["failed"]);
    expect(result.current.query.page).toBe(1);
  });
  it("page-only update keeps page; pageSize resets it", () => {
    const { result } = setup();
    act(() => result.current.update({ page: 2 }));
    expect(result.current.query.page).toBe(2);
    act(() => result.current.update({ pageSize: 50 }));
    expect(result.current.query.page).toBe(0);
    expect(result.current.result.rows).toHaveLength(50);
  });
  it("exposes counts and reset", () => {
    const { result } = setup();
    expect(result.current.counts.all).toBe(600);
    act(() => result.current.update({ tab: "failed" }));
    act(() => result.current.reset());
    expect(result.current.query.tab).toBe("all");
  });
  it("search and tab reset page from a later page", () => {
    const { result } = setup();
    act(() => result.current.setPage(3));
    act(() => result.current.update({ search: "a" }));
    expect(result.current.query.page).toBe(0);
    act(() => result.current.setPage(2));
    act(() => result.current.update({ tab: "failed" }));
    expect(result.current.query.page).toBe(0);
  });
  it("setPage out of range clamps in result", () => {
    const { result } = setup();
    act(() => result.current.setPage(999));
    expect(result.current.result.page).toBe(result.current.result.pageCount - 1);
  });
  it("empty patch resets page", () => {
    const { result } = setup();
    act(() => result.current.setPage(2));
    act(() => result.current.update({}));
    expect(result.current.query.page).toBe(0);
  });

  describe("while data is null", () => {
    const initial = { result: applyQuery(ALL, DEFAULT_QUERY, MOCK_NOW), counts: tabCounts(ALL) };
    const setupNull = () =>
      renderHook(({ all }: { all: Payment[] | null }) => usePaymentsQuery(all, MOCK_NOW, initial), {
        initialProps: { all: null as Payment[] | null },
      });
    it("returns the initial result and counts", () => {
      const { result } = setupNull();
      expect(result.current.result).toBe(initial.result);
      expect(result.current.counts).toBe(initial.counts);
      expect(result.current.pending).toBe(false);
    });
    it("switches to the computed result when data arrives", () => {
      const { result, rerender } = setupNull();
      rerender({ all: ALL });
      expect(result.current.result).toEqual(initial.result);
      expect(result.current.counts.all).toBe(600);
    });
    it("applies an update made before data arrives once data lands", () => {
      const { result, rerender } = setupNull();
      act(() => result.current.update({ tab: "failed" }));
      expect(result.current.pending).toBe(true);
      expect(result.current.result).toBe(initial.result);
      rerender({ all: ALL });
      expect(result.current.pending).toBe(false);
      expect(result.current.result).toEqual(applyQuery(ALL, { ...DEFAULT_QUERY, tab: "failed" }, MOCK_NOW));
    });
  });
});
