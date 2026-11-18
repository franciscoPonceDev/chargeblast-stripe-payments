"use client";

import { useCallback, useMemo, useState } from "react";
import {
  applyQuery,
  DEFAULT_QUERY,
  tabCounts,
  type PaymentsQuery,
  type QueryResult,
  type StatusTab,
} from "./query";
import type { Payment } from "./types";

export interface InitialPayments {
  result: QueryResult;
  counts: Record<StatusTab, number>;
}

const EMPTY: InitialPayments = {
  result: { rows: [], total: 0, page: 0, pageCount: 1 },
  counts: { all: 0, succeeded: 0, refunded: 0, disputed: 0, failed: 0, uncaptured: 0 },
};

/**
 * `all` may be null while the full dataset is loading; the server-computed
 * `initial` result/counts are returned until it arrives. Updates made meanwhile
 * are kept in `query` and applied as soon as `all` lands.
 */
export function usePaymentsQuery(
  all: Payment[] | null,
  now: number,
  initial: InitialPayments = EMPTY,
  initialQuery: PaymentsQuery = DEFAULT_QUERY,
) {
  const [query, setQuery] = useState<PaymentsQuery>(initialQuery);
  const [start] = useState(initialQuery);
  const counts: Record<StatusTab, number> = useMemo(
    () => (all ? tabCounts(all) : initial.counts),
    [all, initial.counts],
  );
  const result: QueryResult = useMemo(() => {
    if (!all) return initial.result;
    const next = applyQuery(all, query, now);
    // Perf: when the full dataset lands and the page is unchanged (same ids, same dataset version), keep the server
    // result's identity so the memoised table does not re-render 25+ rows with identical content.
    const prev = initial.result;
    const same =
      next.total === prev.total &&
      next.page === prev.page &&
      next.pageCount === prev.pageCount &&
      next.rows.length === prev.rows.length &&
      next.rows.every((r, i) => r.id === prev.rows[i].id);
    return same ? prev : next;
  }, [all, query, now, initial.result]);
  const pending = all === null && query !== start;

  const update = useCallback((patch: Partial<PaymentsQuery>) => {
    const keys = Object.keys(patch);
    const pageOnly = keys.length > 0 && keys.every((k) => k === "page");
    setQuery((q) => ({ ...q, ...patch, ...(pageOnly ? {} : { page: 0 }) }));
  }, []);
  const setPage = useCallback((n: number) => setQuery((q) => ({ ...q, page: n })), []);
  /** Replace the whole query (used when the URL changes from outside). */
  const replace = useCallback((q: PaymentsQuery) => setQuery(q), []);
  const reset = useCallback(() => setQuery(DEFAULT_QUERY), []);

  return { query, result, counts, pending, update, setPage, replace, reset };
}
