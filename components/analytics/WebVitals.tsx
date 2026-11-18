"use client";
import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/analytics/events";

const CORE = new Set(["CLS", "INP", "LCP", "FCP", "TTFB"]);

export function WebVitals() {
  useReportWebVitals((m) => {
    // Next.js-hydration, Next.js-route-change-to-render etc. are framework metrics, not Core Web Vitals.
    if (!CORE.has(m.name)) return;
    track("web_vitals", {
      name: m.name as "CLS" | "INP" | "LCP" | "FCP" | "TTFB",
      value: Math.round(m.name === "CLS" ? m.value * 1000 : m.value),
      rating: m.rating,
      id: m.id,
    });
  });
  return null;
}
