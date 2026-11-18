import { DEFAULT_QUERY, type PaymentsQuery } from "@/lib/payments/query";
import { track } from "./events";

const FILTERS = [
  ["date", "date"],
  ["amount", "amount"],
  ["currencies", "currency"],
  ["statuses", "status"],
  ["methods", "method"],
] as const;

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Emits the events implied by a query patch (filters, search, tab, sort, page size). */
export function trackQueryPatch(prev: PaymentsQuery, patch: Partial<PaymentsQuery>): void {
  for (const [key, name] of FILTERS) {
    if (!(key in patch)) continue;
    const next = patch[key];
    if (same(next, prev[key])) continue;
    if (same(next, DEFAULT_QUERY[key])) track("filter_cleared", { filter: name });
    else track("filter_applied", { filter: name, value_count: Array.isArray(next) ? next.length : 1 });
  }
  if (patch.search !== undefined && patch.search !== prev.search) {
    if (patch.search === "") track("filter_cleared", { filter: "search" });
    else track("search_performed", { query_length: patch.search.length });
  }
  if (patch.tab !== undefined && patch.tab !== prev.tab) track("status_tab_selected", { tab: patch.tab });
  if (patch.sort && !same(patch.sort, prev.sort)) {
    const s = patch.sort[0] ?? DEFAULT_QUERY.sort[0];
    track("sort_changed", { column: s.id, direction: s.desc ? "desc" : "asc" });
  }
  if (patch.pageSize !== undefined && patch.pageSize !== prev.pageSize) {
    track("page_changed", { page: 1, page_size: patch.pageSize });
  }
}
