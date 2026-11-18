"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { Banner } from "@/components/payments/Banner";
import { FilterBar } from "@/components/payments/filters/FilterBar";
import { SearchInput } from "@/components/payments/filters/SearchInput";
import { PageHeader } from "@/components/payments/PageHeader";
import { PaymentsTable } from "@/components/payments/PaymentsTable";
import { StatusTabs } from "@/components/payments/StatusTabs";
import { TableFooter } from "@/components/payments/TableFooter";
import { Button } from "@/components/ui";
import { DEFAULT_QUERY, type SortState, type StatusTab } from "@/lib/payments/query";
import type { Payment } from "@/lib/payments/types";
import { usePaymentsQuery } from "@/lib/payments/usePaymentsQuery";

export interface PaymentsViewProps {
  initialRows: Payment[];
  initialTotal: number;
  counts: Record<StatusTab, number>;
  now: number;
  dataVersion: string;
}

let inflight: Promise<Payment[]> | null = null;
let cachedAll: Payment[] | null = null;

/** Test-only: forget the module-level dataset cache and in-flight request. */
export function __resetPaymentsCacheForTests() {
  inflight = null;
  cachedAll = null;
}

function loadAll(version: string): Promise<Payment[]> {
  if (cachedAll) return Promise.resolve(cachedAll);
  if (!inflight) {
    const p = fetch(`/api/payments?v=${encodeURIComponent(version)}`).then((r) => {
      if (!r.ok) throw new Error(`payments ${r.status}`);
      return r.json() as Promise<Payment[]>;
    });
    p.then(
      (rows) => {
        cachedAll = rows;
      },
      () => {
        if (inflight === p) inflight = null;
      },
    );
    inflight = p;
  }
  return inflight;
}

type LoadStatus = "loading" | "ready" | "error";
const RETRY_DELAYS_MS = [1000, 3000, 10000];

export function PaymentsView({ initialRows, initialTotal, counts, now, dataVersion }: PaymentsViewProps) {
  const [all, setAll] = useState<Payment[] | null>(cachedAll);
  const [status, setStatus] = useState<LoadStatus>(cachedAll ? "ready" : "loading");
  const retryRef = useRef<() => void>(() => {});
  useEffect(() => {
    let live = true;
    let state: LoadStatus = cachedAll ? "ready" : "loading";
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const set = (s: LoadStatus) => {
      state = s;
      setStatus(s);
    };
    const attempt = () => {
      clearTimeout(timer);
      set("loading");
      loadAll(dataVersion).then(
        (rows) => {
          if (!live) return;
          setAll(rows);
          set("ready");
        },
        () => {
          if (!live) return;
          set("error");
          if (tries < RETRY_DELAYS_MS.length) timer = setTimeout(attempt, RETRY_DELAYS_MS[tries++]);
        },
      );
    };
    const retry = () => {
      if (state !== "error") return;
      tries = 0;
      attempt();
    };
    retryRef.current = retry;
    if (state !== "ready") attempt();
    window.addEventListener("online", retry);
    window.addEventListener("focus", retry);
    return () => {
      live = false;
      clearTimeout(timer);
      window.removeEventListener("online", retry);
      window.removeEventListener("focus", retry);
    };
  }, [dataVersion]);

  const initial = useMemo(
    () => ({
      result: {
        rows: initialRows,
        total: initialTotal,
        page: DEFAULT_QUERY.page,
        pageCount: Math.max(1, Math.ceil(initialTotal / DEFAULT_QUERY.pageSize)),
      },
      counts,
    }),
    [initialRows, initialTotal, counts],
  );
  const { query, result, update, setPage, pending } = usePaymentsQuery(all, now, initial);
  const tabsRef = useRef<HTMLDivElement>(null);
  const onSortChange = useCallback((sort: SortState[]) => update({ sort }), [update]);
  const focusTabs = useCallback(() => {
    tabsRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
  }, []);
  return (
    <AppShell search={<SearchInput value={query.search} onChange={(search) => update({ search })} />}>
      <PageHeader />
      <div className="mt-(--space-section)">
        <Banner onDismiss={focusTabs} />
      </div>
      <div className="mt-(--space-section)" ref={tabsRef}>
        <StatusTabs value={query.tab} onChange={(tab) => update({ tab })} />
      </div>
      <div className="mt-(--space-section) flex flex-wrap items-center justify-between gap-2">
        <FilterBar query={query} onChange={update} />
        <div className="flex items-center gap-2">
          <Button icon="export">Export</Button>
          <Button icon="gear">Edit columns</Button>
        </div>
      </div>
      <div className="mt-4" aria-busy={(status === "loading" && pending) || undefined}>
        <PaymentsTable rows={result.rows} sort={query.sort} onSortChange={onSortChange} now={now} />
      </div>
      <TableFooter
        result={result}
        pageSize={query.pageSize}
        onPageSizeChange={(pageSize) => update({ pageSize })}
        onPageChange={setPage}
      />
      <div role="status" aria-live="polite">
        {status === "error" && (
          <p className="mt-2 text-caption leading-4 text-text-secondary">
            Couldn&apos;t load all payments.{" "}
            <button
              type="button"
              onClick={() => retryRef.current()}
              className="cursor-pointer rounded-sm text-brand hover:text-brand-hover focus-visible:shadow-focus"
            >
              Retry
            </button>
          </p>
        )}
      </div>
    </AppShell>
  );
}
