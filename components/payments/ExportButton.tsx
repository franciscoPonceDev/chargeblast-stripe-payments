"use client";
import { format } from "date-fns";
import { Button } from "@/components/ui";
import { filterPayments, sortPayments, type PaymentsQuery } from "@/lib/payments/query";
import type { Payment } from "@/lib/payments/types";
import { appTz } from "@/lib/time";

export interface ExportButtonProps {
  /** Full dataset, or null until it has loaded. */
  all: Payment[] | null;
  status: "loading" | "ready" | "error";
  query: PaymentsQuery;
  now: number;
}

function download(csv: string, filename: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportButton({ all, status, query, now }: ExportButtonProps) {
  const reason = status === "ready" && all ? undefined : status === "error" ? "Couldn't load payments" : "Loading payments…";
  const onClick = async () => {
    if (!all) return;
    // Trade-off: CSV module loaded on click so it stays out of the first-load bundle, at the cost of a tiny first-export delay.
    const { toCsv } = await import("@/lib/payments/csv");
    const rows = sortPayments(filterPayments(all, query, now), query.sort);
    download(toCsv(rows), `payments-${format(Date.now(), "yyyy-MM-dd", { in: appTz })}.csv`);
  };
  return (
    <Button icon="export" disabled={!!reason} title={reason} aria-description={reason} onClick={onClick}>
      Export
    </Button>
  );
}
