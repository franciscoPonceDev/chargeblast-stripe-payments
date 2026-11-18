import type { PageSize } from "@/lib/payments/query";

export function PageSizeSelect({ value, onChange }: { value: PageSize; onChange: (n: PageSize) => void }) {
  return (
    <select
      aria-label="Rows per page"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) as PageSize)}
      className="h-(--size-control-sm) cursor-pointer rounded-md border border-border bg-surface px-1 text-body text-text-primary outline-transparent focus-visible:ring-2 focus-visible:ring-brand-ring"
    >
      {[25, 50, 100].map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  );
}
