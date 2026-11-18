import { useCallback, useEffect, useState } from "react";

export const CONSENT_KEY = "consent.analytics.v1";

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

function gtag(...args: unknown[]) {
  const w = window as GtagWindow;
  // GTM only recognises `arguments` objects pushed by gtag(), not plain arrays.
  w.gtag ??= function () {
    // eslint-disable-next-line prefer-rest-params
    (w.dataLayer ??= []).push(arguments);
  };
  w.gtag(...args);
}

export function readConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

export function setConsent(on: boolean): void {
  try {
    localStorage.setItem(CONSENT_KEY, on ? "granted" : "denied");
  } catch {
    /* state still applies for this page load */
  }
  gtag("consent", "update", { analytics_storage: on ? "granted" : "denied" });
}

// Trade-off: consent is denied by default and only read after mount, so SSR and first paint stay identical.
export function useAnalyticsConsent(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(readConsent()), []);
  const set = useCallback((v: boolean) => {
    setOn(v);
    setConsent(v);
  }, []);
  return [on, set];
}
