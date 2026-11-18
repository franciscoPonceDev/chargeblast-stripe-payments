import type { Variant } from "@/lib/experiments";
import { track } from "./events";

const seen = new Set<string>();

/** Fires `experiment_viewed` once per browser session (sessionStorage; in-memory fallback). */
export function trackExposureOnce(experiment: "banner_cta", variant: Variant): void {
  const key = `exp.${experiment}.v1`;
  if (seen.has(key)) return;
  seen.add(key);
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, variant);
  } catch {
    /* storage blocked: the in-memory set still dedupes within this page load */
  }
  track("experiment_viewed", { experiment, variant });
}

/** Test-only. */
export function __resetExposureForTests() {
  seen.clear();
}
