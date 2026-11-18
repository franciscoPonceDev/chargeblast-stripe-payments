"use client";
import { useRouter } from "next/navigation";
import { memo, useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import type { SortState } from "@/lib/payments/query";
import type { Payment } from "@/lib/payments/types";
import { buildColumns } from "./columns";

function padFor(id: string) {
  if (id === "select") return "w-10 px-(--space-cell-select)";
  if (id === "actions") return "w-(--size-actions-col) min-w-(--size-actions-col) px-1";
  if (id === "amount") return "pr-1 pl-(--space-cell-x)";
  if (id === "currency") return "pr-(--space-cell-x) pl-0";
  return "px-(--space-cell-x)";
}

const INTERACTIVE = "a, button, input, label, [role='checkbox'], [role='button']";

export const EMPTY_MESSAGE = "No results found";

function PaymentsTableImpl({
  rows,
  sort,
  onSortChange,
  now,
}: {
  rows: Payment[];
  sort: SortState[];
  onSortChange: (s: SortState[]) => void;
  now: number;
}) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const columns = useMemo(() => buildColumns({ sort, onSortChange, now }), [sort, onSortChange, now]);
  const sorting: SortingState = sort;

  useEffect(() => {
    const ids = new Set(rows.map((r) => r.id));
    setRowSelection((prev) => {
      const keys = Object.keys(prev);
      if (keys.every((k) => ids.has(k))) return prev;
      return Object.fromEntries(keys.filter((k) => ids.has(k)).map((k) => [k, true]));
    });
  }, [rows]);

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (p) => p.id,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: { sorting, rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  });

  const ariaSort = (id: string) => {
    const s = sort[0]?.id === id ? sort[0] : undefined;
    return s ? (s.desc ? "descending" : "ascending") : undefined;
  };

  const bodyRows = table.getRowModel().rows;

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full border-collapse whitespace-nowrap text-table text-text-primary">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="h-10">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  scope="col"
                  aria-sort={ariaSort(h.column.id)}
                  className={`${padFor(h.column.id)}${h.column.id === "actions" ? " sticky right-0 bg-surface" : ""} py-2.5 text-caption leading-5 font-semibold text-text-secondary shadow-[inset_0_-1px_0_var(--color-border-row)] ${h.column.id === "amount" ? "text-right" : "text-left"}`}
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {bodyRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-(--space-cell-x) py-8 text-center text-text-muted">
                {EMPTY_MESSAGE}
              </td>
            </tr>
          ) : (
            bodyRows.map((row) => (
              <tr
                key={row.id}
                className="group h-11 cursor-pointer hover:bg-bg-hover focus-within:bg-bg-hover"
                onClick={(e) => {
                  if ((e.target as Element).closest(INTERACTIVE)) return;
                  router.push(`/payments/${row.original.id}`);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`${padFor(cell.column.id)}${cell.column.id === "actions" ? " sticky right-0 bg-surface group-focus-within:bg-bg-hover group-hover:bg-bg-hover" : ""} py-0 shadow-[inset_0_-1px_0_var(--color-border-row)] ${cell.column.id === "amount" ? "text-right" : "text-left"}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export const PaymentsTable = memo(PaymentsTableImpl);
