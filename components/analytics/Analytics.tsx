"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";

// Trade-off: web-vitals is code-split and loads after hydration to keep first-load JS small; its observers are buffered, so metrics are not lost.
const WebVitals = dynamic(() => import("./WebVitals").then((m) => m.WebVitals), { ssr: false });

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

export function Analytics() {
  useEffect(() => {
    // Dynamic import keeps posthog-js out of the default bundle; it is fetched only when a key is set.
    if (POSTHOG_KEY) void import("@/lib/analytics/posthog").then((m) => m.initPosthog(POSTHOG_KEY));
  }, []);
  return <WebVitals />;
}
