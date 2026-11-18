"use client";
import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/analytics/events";

export function WebVitals() {
  useReportWebVitals((m) => {
    track("web_vitals", {
      name: m.name,
      value: Math.round(m.name === "CLS" ? m.value * 1000 : m.value),
      rating: m.rating ?? "unknown",
      id: m.id,
    });
  });
  return null;
}
