import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui";
import { currencyCode, formatAmount, formatDateTime, shortenId } from "@/lib/format";
import type { SortState } from "@/lib/payments/query";
import type { Payment } from "@/lib/payments/types";
import { CopyIdButton } from "./CopyIdButton";
import { CreatedCell } from "./CreatedCell";
import { RowActions } from "./RowActions";
import { PaymentMethodCell } from "./PaymentMethodCell";
import { SortHeader } from "./SortHeader";
import { StatusBadge } from "./StatusBadge";

export interface ColumnCtx {
  sort: SortState[];
  onSortChange: (s: SortState[]) => void;
  now: number;
}

const DASH = "—";

export function buildColumns({ sort, onSortChange, now }: ColumnCtx): ColumnDef<Payment>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all payments"
          checked={table.getIsSomeRowsSelected() ? "indeterminate" : table.getIsAllRowsSelected()}
          onCheckedChange={(v) => table.toggleAllRowsSelected(v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select payment ${row.original.id}`}
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(v)}
        />
      ),
    },
    {
      id: "amount",
      header: () => <SortHeader id="amount" label="Amount" sort={sort} onSortChange={onSortChange} align="right" />,
      cell: ({ row: { original: p } }) => (
        <span className="flex items-baseline justify-end gap-1">
          <span className="font-semibold tabular-nums">{formatAmount(p.amount, p.currency)}</span>
          <span className="text-text-secondary">{currencyCode(p.currency)}</span>
        </span>
      ),
    },
    {
      id: "status",
      header: () => <SortHeader id="status" label="Status" sort={sort} onSortChange={onSortChange} />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "paymentId",
      header: "Payment ID",
      cell: ({ row }) => (
        <span className="inline-flex h-[26px] items-center gap-1 rounded-md border border-border-row bg-bg-hover py-0.5 pr-1 pl-1.5 font-mono text-caption text-text-secondary">
          <span className="tabular-nums">{shortenId(row.original.id)}</span>
          <CopyIdButton id={row.original.id} />
        </span>
      ),
    },
    {
      id: "method",
      header: "Payment method",
      cell: ({ row }) => <PaymentMethodCell method={row.original.method} />,
    },
    {
      id: "description",
      header: "Description",
      cell: ({ row }) => <span className="block max-w-48 truncate">{row.original.description}</span>,
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => <span className="block max-w-56 truncate">{row.original.customerEmail}</span>,
    },
    {
      id: "created",
      header: () => <SortHeader id="created" label="Date" sort={sort} onSortChange={onSortChange} />,
      cell: ({ row }) => <CreatedCell created={row.original.created} now={now} />,
    },
    {
      id: "refundedAt",
      header: "Refunded date",
      cell: ({ row }) => (row.original.refundedAt ? formatDateTime(row.original.refundedAt, now) : DASH),
    },
    {
      id: "declineReason",
      header: "Decline reason",
      cell: ({ row }) => row.original.declineReason ?? DASH,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: () => <RowActions />,
    },
  ];
}
