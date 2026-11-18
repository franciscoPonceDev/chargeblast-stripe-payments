import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ cb: null as null | ((m: unknown) => void) }));
vi.mock("next/web-vitals", () => ({ useReportWebVitals: (cb: (m: unknown) => void) => void (h.cb = cb) }));
import { WebVitals } from "./WebVitals";

beforeEach(() => {
  window.dataLayer = [];
});

describe("WebVitals", () => {
  it("forwards only Core Web Vitals, CLS scaled x1000", () => {
    render(<WebVitals />);
    h.cb!({ name: "CLS", value: 0.1234, rating: "good", id: "v1" });
    h.cb!({ name: "LCP", value: 2400.6, rating: "needs-improvement", id: "v2" });
    h.cb!({ name: "Next.js-hydration", value: 90, rating: "good", id: "v3" });
    expect(window.dataLayer).toEqual([
      { event: "web_vitals", name: "CLS", value: 123, rating: "good", id: "v1" },
      { event: "web_vitals", name: "LCP", value: 2401, rating: "needs-improvement", id: "v2" },
    ]);
  });
});
