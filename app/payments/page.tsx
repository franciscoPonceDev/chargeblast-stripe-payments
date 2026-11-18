"use client";
import { useCallback, useRef } from "react";
import { Banner } from "@/components/payments/Banner";
import { FilterBar } from "@/components/payments/filters/FilterBar";
import { SearchInput } from "@/components/payments/filters/SearchInput";
import { PageHeader } from "@/components/payments/PageHeader";
import { PaymentsTable } from "@/components/payments/PaymentsTable";
import { StatusTabs } from "@/components/payments/StatusTabs";
import { TableFooter } from "@/components/payments/TableFooter";
import { Button } from "@/components/ui";
import data from "@/data/payments.json";
import { MOCK_NOW } from "@/lib/payments/generate";
import type { Payment } from "@/lib/payments/types";
import type { SortState } from "@/lib/payments/query";
import { usePaymentsQuery } from "@/lib/payments/usePaymentsQuery";

const ALL = data as Payment[];

export default function PaymentsPage() {
  const { query, result, update, setPage } = usePaymentsQuery(ALL, MOCK_NOW);
  const tabsRef = useRef<HTMLDivElement>(null);
  const onSortChange = useCallback((sort: SortState[]) => update({ sort }), [update]);
  const focusTabs = useCallback(() => {
    tabsRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
  }, []);
  return (
    <main className="px-(--space-page-x) pb-(--space-page-bottom)">
      <div className="flex h-(--size-topbar) items-center">
        <div className="w-full max-w-(--size-search-max)">
          <SearchInput value={query.search} onChange={(search) => update({ search })} />
        </div>
      </div>
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
      <div className="mt-4">
        <PaymentsTable rows={result.rows} sort={query.sort} onSortChange={onSortChange} now={MOCK_NOW} />
      </div>
      <TableFooter
        result={result}
        pageSize={query.pageSize}
        onPageSizeChange={(pageSize) => update({ pageSize })}
        onPageChange={setPage}
      />
    </main>
  );
}
