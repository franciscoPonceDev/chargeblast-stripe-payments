"use client";
import { useEffect, useState, type ComponentType } from "react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

export function Analytics() {
  const [WebVitals, setWebVitals] = useState<ComponentType | null>(null);
  useEffect(() => {
    // Trade-off: web-vitals and posthog-js load via import() after hydration, keeping them out of first-load JS; observers are buffered, so early metrics are not lost.
    void import("./WebVitals").then((m) => setWebVitals(() => m.WebVitals));
    if (POSTHOG_KEY) void import("@/lib/analytics/posthog").then((m) => m.initPosthog(POSTHOG_KEY));
  }, []);
  return WebVitals ? <WebVitals /> : null;
}
