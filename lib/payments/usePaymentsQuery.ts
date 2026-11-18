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

export function usePaymentsQuery(all: Payment[], now: number) {
  const [query, setQuery] = useState<PaymentsQuery>(DEFAULT_QUERY);
  const counts: Record<StatusTab, number> = useMemo(() => tabCounts(all), [all]);
  const result: QueryResult = useMemo(() => applyQuery(all, query, now), [all, query, now]);

  const update = useCallback((patch: Partial<PaymentsQuery>) => {
    const pageOnly = Object.keys(patch).every((k) => k === "page");
    setQuery((q) => ({ ...q, ...patch, ...(pageOnly ? {} : { page: 0 }) }));
  }, []);
  const setPage = useCallback((n: number) => setQuery((q) => ({ ...q, page: n })), []);
  const reset = useCallback(() => setQuery(DEFAULT_QUERY), []);

  return { query, result, counts, update, setPage, reset };
}
