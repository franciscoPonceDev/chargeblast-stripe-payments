import { beforeEach, describe, expect, it } from "vitest";
import { __resetExposureForTests, trackExposureOnce } from "./exposure";

beforeEach(() => {
  window.dataLayer = [];
  sessionStorage.clear();
  __resetExposureForTests();
});

describe("trackExposureOnce", () => {
  it("fires once per session", () => {
    trackExposureOnce("banner_cta", "b");
    trackExposureOnce("banner_cta", "b");
    expect(window.dataLayer).toEqual([{ event: "experiment_viewed", experiment: "banner_cta", variant: "b" }]);
  });
  it("does not refire after a reload in the same session", () => {
    trackExposureOnce("banner_cta", "a");
    __resetExposureForTests(); // reload: memory gone, sessionStorage kept
    trackExposureOnce("banner_cta", "a");
    expect(window.dataLayer).toHaveLength(1);
  });
});
