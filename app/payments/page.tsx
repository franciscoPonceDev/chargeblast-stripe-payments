"use client";
import { useMemo, useState } from "react";
import { PaymentsTable } from "@/components/payments/PaymentsTable";
import data from "@/data/payments.json";
import { MOCK_NOW } from "@/lib/payments/generate";
import { applyQuery, DEFAULT_QUERY, type SortState } from "@/lib/payments/query";
import type { Payment } from "@/lib/payments/types";

export default function PaymentsPage() {
  const [sort, setSort] = useState<SortState[]>(DEFAULT_QUERY.sort);
  const rows = useMemo(
    () => applyQuery((data as Payment[]).slice(0, 25), { ...DEFAULT_QUERY, sort }, MOCK_NOW).rows,
    [sort],
  );
  return (
    <main>
      <h1>Transactions</h1>
      <PaymentsTable rows={rows} sort={sort} onSortChange={setSort} now={MOCK_NOW} />
    </main>
  );
}
