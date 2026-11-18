import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CONSENT_KEY, useAnalyticsConsent } from "./consent";

beforeEach(() => {
  localStorage.clear();
  window.dataLayer = [];
});

describe("useAnalyticsConsent", () => {
  it("defaults to denied and persists + pushes consent update on toggle", () => {
    const { result } = renderHook(() => useAnalyticsConsent());
    expect(result.current[0]).toBe(false);
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem(CONSENT_KEY)).toBe("granted");
    const last = Array.from(window.dataLayer!.at(-1) as ArrayLike<unknown>);
    expect(last).toEqual(["consent", "update", { analytics_storage: "granted" }]);
  });
  it("restores a stored grant", () => {
    localStorage.setItem(CONSENT_KEY, "granted");
    const { result } = renderHook(() => useAnalyticsConsent());
    expect(result.current[0]).toBe(true);
  });
});
