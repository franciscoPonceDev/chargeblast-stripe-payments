import { useCallback, useEffect, useState } from "react";
import { CONSENT_KEY } from "./consentKey";

export { CONSENT_KEY };

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

type Listener = (on: boolean) => void;
const listeners = new Set<Listener>();

/** Subscribe to consent changes (this tab, and other tabs once a consent hook is mounted). Returns unsubscribe. */
export function onConsentChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

function emit(on: boolean) {
  listeners.forEach((l) => l(on));
}

export function setConsent(on: boolean): void {
  try {
    localStorage.setItem(CONSENT_KEY, on ? "granted" : "denied");
  } catch {
    /* state still applies for this page load */
  }
  gtag("consent", "update", { analytics_storage: on ? "granted" : "denied" });
  emit(on);
}

// Trade-off: consent is denied by default and only read after mount, so SSR and first paint stay identical.
export function useAnalyticsConsent(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(readConsent());
    // Cross-tab sync: another tab changed the stored choice.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== CONSENT_KEY) return;
      const v = e.newValue === "granted";
      setOn(v);
      gtag("consent", "update", { analytics_storage: v ? "granted" : "denied" });
      emit(v);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const set = useCallback((v: boolean) => {
    setOn(v);
    setConsent(v);
  }, []);
  return [on, set];
}
