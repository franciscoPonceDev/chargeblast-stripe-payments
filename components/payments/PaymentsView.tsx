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
}

let inflight: Promise<Payment[]> | null = null;
function loadAll(): Promise<Payment[]> {
  if (!inflight) {
    const p = fetch("/api/payments").then((r) => {
      if (!r.ok) throw new Error(`payments ${r.status}`);
      return r.json() as Promise<Payment[]>;
    });
    p.catch(() => {
      if (inflight === p) inflight = null;
    });
    inflight = p;
  }
  return inflight;
}

export function PaymentsView({ initialRows, initialTotal, counts, now }: PaymentsViewProps) {
  const [all, setAll] = useState<Payment[] | null>(null);
  useEffect(() => {
    let live = true;
    loadAll().then(
      (rows) => {
        if (live) setAll(rows);
      },
      () => {},
    );
    return () => {
      live = false;
    };
  }, []);

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
      <div className="mt-4" aria-busy={pending || undefined}>
        <PaymentsTable rows={result.rows} sort={query.sort} onSortChange={onSortChange} now={now} />
      </div>
      <TableFooter
        result={result}
        pageSize={query.pageSize}
        onPageSizeChange={(pageSize) => update({ pageSize })}
        onPageChange={setPage}
      />
    </AppShell>
  );
}
