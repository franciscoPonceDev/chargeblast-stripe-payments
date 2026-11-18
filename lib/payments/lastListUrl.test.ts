import { afterEach, describe, expect, it, vi } from "vitest";
import { readListUrl, saveListUrl } from "./lastListUrl";

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("lastListUrl", () => {
  it("falls back to /payments when nothing is saved", () => {
    expect(readListUrl()).toBe("/payments");
  });
  it("returns the saved list URL", () => {
    saveListUrl("/payments?status=failed&page=2");
    expect(readListUrl()).toBe("/payments?status=failed&page=2");
  });
  it("ignores foreign values", () => {
    sessionStorage.setItem("payments:lastListUrl", "https://evil.example/");
    expect(readListUrl()).toBe("/payments");
  });
  it("survives unavailable storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => saveListUrl("/payments?x=1")).not.toThrow();
    expect(readListUrl()).toBe("/payments");
  });
});
