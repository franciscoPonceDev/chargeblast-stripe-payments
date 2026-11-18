import { Icon } from "@/components/ui";
import { DEFAULT_QUERY, type SortKey, type SortState } from "@/lib/payments/query";

export function nextSort(sort: SortState[], id: SortKey, shift: boolean): SortState[] {
  const cur = sort.find((s) => s.id === id);
  if (shift) {
    if (!cur) return [...sort, { id, desc: true }];
    if (cur.desc) return sort.map((s) => (s.id === id ? { id, desc: false } : s));
    const rest = sort.filter((s) => s.id !== id);
    return rest.length ? rest : DEFAULT_QUERY.sort.map((x) => ({ ...x }));
  }
  if (!cur || sort.length > 1) return [{ id, desc: true }];
  if (cur.desc) return [{ id, desc: false }];
  return DEFAULT_QUERY.sort.map((x) => ({ ...x }));
}

export function SortHeader({
  id,
  label,
  sort,
  onSortChange,
  align = "left",
}: {
  id: SortKey;
  label: string;
  sort: SortState[];
  onSortChange: (s: SortState[]) => void;
  align?: "left" | "right";
}) {
  const cur = sort.find((s) => s.id === id);
  return (
    <button
      type="button"
      onClick={(e) => onSortChange(nextSort(sort, id, e.shiftKey))}
      className={`inline-flex cursor-pointer items-center gap-1 rounded-sm font-semibold outline-transparent ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      {label}
      {cur && <Icon name={cur.desc ? "chevron-down" : "chevron-up"} size={12} />}
    </button>
  );
}
