import type { PageSize } from "@/lib/payments/query";

export function PageSizeSelect({ value, onChange }: { value: PageSize; onChange: (n: PageSize) => void }) {
  return (
    <select
      aria-label="Rows per page"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) as PageSize)}
      className="h-(--size-control-md) cursor-pointer rounded-md bg-surface px-1 text-caption text-control shadow-ring"
    >
      {[25, 50, 100].map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  );
}
