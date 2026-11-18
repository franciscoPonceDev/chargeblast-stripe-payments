const KEY = "payments:lastListUrl";
export const DEFAULT_LIST_URL = "/payments";

export function saveListUrl(url: string): void {
  try {
    sessionStorage.setItem(KEY, url);
  } catch {}
}

/** Only call after mount (reads sessionStorage). Anything that is not a /payments list URL falls back. */
export function readListUrl(): string {
  try {
    const v = sessionStorage.getItem(KEY);
    if (v && (v === DEFAULT_LIST_URL || v.startsWith(`${DEFAULT_LIST_URL}?`))) return v;
  } catch {}
  return DEFAULT_LIST_URL;
}
