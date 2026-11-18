"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { Banner } from "@/components/payments/Banner";
import { EditColumns } from "@/components/payments/EditColumns";
import { ExportButton } from "@/components/payments/ExportButton";
import { FilterBar } from "@/components/payments/filters/FilterBar";
import { SearchInput } from "@/components/payments/filters/SearchInput";
import { PageHeader } from "@/components/payments/PageHeader";
import { PaymentsTable } from "@/components/payments/PaymentsTable";
import { StatusTabs } from "@/components/payments/StatusTabs";
import { TableFooter } from "@/components/payments/TableFooter";
import { useTableSettings } from "@/lib/payments/tableSettings";
import { type PaymentsQuery, type SortState, type StatusTab } from "@/lib/payments/query";
import { parseQuery, serializeQuery } from "@/lib/payments/url";
import type { Payment } from "@/lib/payments/types";
import { usePaymentsQuery } from "@/lib/payments/usePaymentsQuery";

export interface PaymentsViewProps {
  initialRows: Payment[];
  initialTotal: number;
  /** Query parsed from the URL, page already clamped to the server result. */
  initialQuery: PaymentsQuery;
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

// Trade-off: full dataset fetched after hydration; small first load and instant client filtering, at the cost of a late fetch.
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

export function PaymentsView({ initialRows, initialTotal, initialQuery, counts, now, dataVersion }: PaymentsViewProps) {
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
        page: initialQuery.page,
        pageCount: Math.max(1, Math.ceil(initialTotal / initialQuery.pageSize)),
      },
      counts,
    }),
    [initialRows, initialTotal, initialQuery, counts],
  );
  const { query, result, update, setPage, replace, pending } = usePaymentsQuery(all, now, initial, initialQuery);

  // Keep the URL in step with the query (replace: no history spam) and the query in step with
  // external URL changes (back/forward, in-app links). `synced` is the last query string we wrote or
  // adopted; URL changes seen while our own replace is pending are echoes, not navigation.
  const router = useRouter();
  const pathname = usePathname();
  const urlString = useSearchParams()?.toString() ?? "";
  const [isPending, startTransition] = useTransition();
  const synced = useRef(urlString); // starts as the real URL so a non-canonical link is rewritten once on mount
  const seenUrl = useRef(urlString);
  useEffect(() => {
    const qs = serializeQuery(query).toString();
    if (qs === synced.current) return;
    synced.current = qs;
    startTransition(() => router.replace(qs ? `?${qs}` : pathname, { scroll: false }));
  }, [query, router, pathname]);
  useEffect(() => {
    if (urlString === seenUrl.current) return;
    seenUrl.current = urlString;
    if (isPending || urlString === synced.current) return;
    synced.current = urlString;
    replace(parseQuery(new URLSearchParams(urlString)));
  }, [urlString, isPending, replace]);
  const { settings, setColumnVisible, setWrap, reset: resetSettings } = useTableSettings();
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
          <ExportButton all={all} status={status} query={query} now={now} />
          <EditColumns
            settings={settings}
            onColumnVisibleChange={setColumnVisible}
            onWrapChange={setWrap}
            onReset={resetSettings}
          />
        </div>
      </div>
      <div className="mt-4" aria-busy={(status === "loading" && pending) || undefined}>
        <PaymentsTable rows={result.rows} sort={query.sort} onSortChange={onSortChange} now={now} hiddenColumns={settings.hidden} wrap={settings.wrap} />
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
