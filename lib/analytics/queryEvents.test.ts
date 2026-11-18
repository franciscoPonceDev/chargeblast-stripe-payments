import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_QUERY } from "@/lib/payments/query";
import { trackQueryPatch } from "./queryEvents";

beforeEach(() => {
  window.dataLayer = [];
});

describe("trackQueryPatch", () => {
  it("filter apply pushes filter_applied with a value count", () => {
    trackQueryPatch(DEFAULT_QUERY, { statuses: ["failed", "refunded"] });
    expect(window.dataLayer).toEqual([{ event: "filter_applied", filter: "status", value_count: 2 }]);
  });
  it("clearing a filter pushes filter_cleared", () => {
    trackQueryPatch({ ...DEFAULT_QUERY, currencies: ["usd"] }, { currencies: [] });
    expect(window.dataLayer).toEqual([{ event: "filter_cleared", filter: "currency" }]);
  });
  it("search sends only the length, never the text", () => {
    trackQueryPatch(DEFAULT_QUERY, { search: "jane@example.com" });
    expect(window.dataLayer).toEqual([{ event: "search_performed", query_length: 16 }]);
  });
  it("sort change pushes column and direction", () => {
    trackQueryPatch(DEFAULT_QUERY, { sort: [{ id: "amount", desc: false }] });
    expect(window.dataLayer).toEqual([{ event: "sort_changed", column: "amount", direction: "asc" }]);
  });
  it("sort cleared to default emits nothing", () => {
    trackQueryPatch({ ...DEFAULT_QUERY, sort: [{ id: "amount", desc: false }] }, { sort: DEFAULT_QUERY.sort });
    expect(window.dataLayer).toEqual([]);
  });
  it("tab change is tracked, unchanged values are not", () => {
    trackQueryPatch(DEFAULT_QUERY, { tab: "failed", statuses: [] });
    expect(window.dataLayer).toEqual([{ event: "status_tab_selected", tab: "failed" }]);
  });
});
