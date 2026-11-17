"use client";
import { useMemo, useState } from "react";
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
    const s = sort.find((x) => x.id === id);
    return s ? (s.desc ? "descending" : "ascending") : undefined;
  };

  const bodyRows = table.getRowModel().rows;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse whitespace-nowrap text-table text-text-primary">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-border-row">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  scope="col"
                  aria-sort={ariaSort(h.column.id)}
                  className={`px-2 py-2 font-semibold text-text-muted ${h.column.id === "amount" ? "text-right" : "text-left"}`}
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
              <td colSpan={columns.length} className="px-2 py-8 text-center text-text-muted">
                {EMPTY_MESSAGE}
              </td>
            </tr>
          ) : (
            bodyRows.map((row) => (
              <tr key={row.id} className="group h-9 border-b border-border-row hover:bg-bg-hover">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-2 py-1 ${cell.column.id === "amount" ? "text-right" : "text-left"}`}
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
