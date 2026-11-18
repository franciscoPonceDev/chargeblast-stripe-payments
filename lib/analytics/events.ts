// Typed event layer. Contract with GTM: every call pushes `{ event: name, ...params }` to window.dataLayer.
// Trade-off: params carry counts and enums only; raw search text, emails, names and payment ids are never sent.

type Empty = Record<string, never>;

export interface AnalyticsEventMap {
  filter_applied: { filter: string; value_count: number };
  filter_cleared: { filter: string };
  search_performed: { query_length: number };
  sort_changed: { column: string; direction: "asc" | "desc" };
  page_changed: { page: number; page_size: number };
  export_csv: { row_count: number };
  payment_id_copied: Empty;
  payment_opened: Empty;
  status_tab_selected: { tab: string };
  banner_cta_clicked: { variant: string };
  banner_dismissed: Empty;
  experiment_viewed: { experiment: string; variant: string };
  web_vitals: { name: string; value: number; rating: string; id: string };
}

export type AnalyticsAdapter = (name: string, params: Record<string, unknown>) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const adapters = new Set<AnalyticsAdapter>();

/** Forward every tracked event to another sink (e.g. PostHog). Returns an unregister function. */
export function registerAdapter(adapter: AnalyticsAdapter): () => void {
  adapters.add(adapter);
  return () => void adapters.delete(adapter);
}

export function track<K extends keyof AnalyticsEventMap>(name: K, params: AnalyticsEventMap[K]): void {
  if (typeof window === "undefined") return;
  (window.dataLayer ??= []).push({ event: name, ...params });
  for (const a of adapters) {
    try {
      a(name, params);
    } catch {
      /* analytics must never break the UI */
    }
  }
}
