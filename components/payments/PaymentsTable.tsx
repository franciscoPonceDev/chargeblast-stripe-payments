"use client";
import { useEffect, useMemo, useState } from "react";
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

export const EMPTY_MESSAGE = "No results found";

export function PaymentsTable({
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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse whitespace-nowrap text-table text-text-primary">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="h-10">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  scope="col"
                  aria-sort={ariaSort(h.column.id)}
                  className={`${h.column.id === "select" ? "w-10 px-[13px]" : h.column.id === "actions" ? "sticky right-0 w-10 bg-surface px-2" : "px-4"} py-2.5 text-caption leading-5 font-semibold text-text-secondary shadow-[inset_0_-1px_0_var(--color-border-row)] ${h.column.id === "amount" ? "text-right" : "text-left"}`}
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
              <td colSpan={columns.length} className="px-4 py-8 text-center text-text-muted">
                {EMPTY_MESSAGE}
              </td>
            </tr>
          ) : (
            bodyRows.map((row) => (
              <tr key={row.id} className="group h-11 hover:bg-bg-hover focus-within:bg-bg-hover">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`${cell.column.id === "select" ? "px-[13px]" : cell.column.id === "actions" ? "sticky right-0 w-10 bg-surface px-2 group-focus-within:bg-bg-hover group-hover:bg-bg-hover" : "px-4"} py-0 shadow-[inset_0_-1px_0_var(--color-border-row)] ${cell.column.id === "amount" ? "text-right" : "text-left"}`}
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
