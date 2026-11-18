import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerAdapter, track } from "./events";

beforeEach(() => {
  window.dataLayer = undefined;
});
afterEach(() => {
  window.dataLayer = undefined;
});

describe("track", () => {
  it("creates dataLayer and pushes { event, ...params }", () => {
    track("sort_changed", { column: "amount", direction: "desc" });
    expect(window.dataLayer).toEqual([{ event: "sort_changed", column: "amount", direction: "desc" }]);
  });
  it("appends to an existing dataLayer", () => {
    window.dataLayer = [{ a: 1 }];
    track("export_csv", { row_count: 3 });
    expect(window.dataLayer).toHaveLength(2);
  });
  it("never puts an @ (PII) in any event payload", () => {
    track("search_performed", { query_length: "jane@example.com".length });
    track("filter_applied", { filter: "status", value_count: 2 });
    track("payment_id_copied", {});
    expect(JSON.stringify(window.dataLayer)).not.toContain("@");
  });
  it("forwards to adapters and survives a throwing adapter", () => {
    const good = vi.fn();
    const off1 = registerAdapter(() => {
      throw new Error("x");
    });
    const off2 = registerAdapter(good);
    track("banner_cta_clicked", { variant: "a" });
    expect(good).toHaveBeenCalledWith("banner_cta_clicked", { variant: "a" });
    off1();
    off2();
    track("banner_dismissed", {});
    expect(good).toHaveBeenCalledTimes(1);
  });
});
