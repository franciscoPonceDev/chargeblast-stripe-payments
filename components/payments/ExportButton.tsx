"use client";
import { format } from "date-fns";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { track } from "@/lib/analytics/events";
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
  // Trade-off: revoke after a delay; some browsers start the download asynchronously and an instant revoke can cancel it.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function ExportButton({ all, status, query, now }: ExportButtonProps) {
  const reasonId = useId();
  const busy = useRef(false);
  const [failed, setFailed] = useState(false);
  const reason = status === "ready" && all ? undefined : status === "error" ? "Couldn't load payments" : "Loading payments…";
  const onClick = async () => {
    if (!all || busy.current) return;
    busy.current = true;
    setFailed(false);
    try {
      // Trade-off: CSV module loaded on click so it stays out of the first-load bundle, at the cost of a tiny first-export delay.
      const { toCsv } = await import("@/lib/payments/csv");
      const rows = sortPayments(filterPayments(all, query, now), query.sort);
      download(toCsv(rows), `payments-${format(now, "yyyy-MM-dd", { in: appTz })}.csv`);
      track("export_csv", { row_count: rows.length });
    } catch {
      setFailed(true);
    } finally {
      busy.current = false;
    }
  };
  return (
    <>
      {/* aria-disabled (not disabled) keeps the button focusable so keyboard and screen-reader users can learn why. */}
      <Button
        icon="export"
        aria-disabled={reason ? true : undefined}
        aria-describedby={reason ? reasonId : undefined}
        title={reason}
        className="aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-surface!"
        onClick={reason ? undefined : onClick}
      >
        Export
      </Button>
      {reason && (
        <span id={reasonId} className="sr-only">
          {reason}
        </span>
      )}
      {/* Out of flow (anchored under the button cluster, inside the 16px gap above the table) so the message cannot shift neighbours. */}
      <div role="status" className={failed ? "absolute top-full right-0 text-caption leading-4 whitespace-nowrap text-text-secondary" : "sr-only"}>
        {failed ? "Couldn't export payments. Try again." : ""}
      </div>
    </>
  );
}
