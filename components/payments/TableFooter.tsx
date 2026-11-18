import { Button } from "@/components/ui";
import type { PageSize, QueryResult } from "@/lib/payments/query";
import { PageSizeSelect } from "./PageSizeSelect";

const fmt = (n: number) => n.toLocaleString("en-US");

export function TableFooter({
  result,
  pageSize,
  onPageSizeChange,
  onPageChange,
}: {
  result: QueryResult;
  pageSize: PageSize;
  onPageSizeChange: (n: PageSize) => void;
  onPageChange: (n: number) => void;
}) {
  const { total, page, pageCount, rows } = result;
  const start = page * pageSize + 1;
  const end = page * pageSize + rows.length;
  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border-row py-2 text-caption leading-4 text-text-secondary">
      <span aria-live="polite">{total === 0 ? "Viewing 0 results" : `Viewing ${fmt(start)}–${fmt(end)} of ${fmt(total)} results`}</span>
      <div className="flex items-center gap-2">
        <PageSizeSelect value={pageSize} onChange={onPageSizeChange} />
        <Button disabled={page <= 0} onClick={() => onPageChange(page - 1)}>Previous</Button>
        <Button disabled={page >= pageCount - 1} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
