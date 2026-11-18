"use client";

import { useState } from "react";
import type { AmountFilter } from "@/lib/payments/query";
import { FilterForm, FilterPill, inputClass } from "./FilterPill";

type Op = "eq" | "between" | "gt" | "lt";
const OPS: { id: Op; label: string }[] = [
  { id: "eq", label: "is equal to" },
  { id: "between", label: "is between" },
  { id: "gt", label: "is greater than" },
  { id: "lt", label: "is less than" },
];

export function amountSummary(f: AmountFilter): string | null {
  if (f.op === "any") return null;
  const label = OPS.find((o) => o.id === f.op)!.label;
  return f.op === "between" ? `${label} ${f.min} and ${f.max}` : `${label} ${f.value}`;
}

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function AmountForm({ value, onApply }: { value: AmountFilter; onApply: (a: AmountFilter) => void }) {
  const [op, setOp] = useState<Op>(value.op === "any" ? "eq" : value.op);
  const [a, setA] = useState(value.op === "between" ? String(value.min) : value.op === "any" ? "" : String(value.value));
  const [b, setB] = useState(value.op === "between" ? String(value.max) : "");
  const ok = (n: number) => Number.isFinite(n) && n >= 0;
  const canApply = op === "between" ? ok(num(a)) && ok(num(b)) : ok(num(a));
  return (
    <FilterForm
      canApply={canApply}
      onApply={() => onApply(op === "between" ? { op, min: Math.min(num(a), num(b)), max: Math.max(num(a), num(b)) } : { op, value: num(a) })}
    >
      <select aria-label="Condition" value={op} onChange={(e) => setOp(e.target.value as Op)} className={inputClass}>
        {OPS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      {op === "between" ? (
        <div className="flex gap-2">
          <input type="number" min={0} step="any" aria-label="Minimum" placeholder="Min" value={a} onChange={(e) => setA(e.target.value)} className={inputClass} />
          <input type="number" min={0} step="any" aria-label="Maximum" placeholder="Max" value={b} onChange={(e) => setB(e.target.value)} className={inputClass} />
        </div>
      ) : (
        <input type="number" min={0} step="any" aria-label="Amount" placeholder="0.00" value={a} onChange={(e) => setA(e.target.value)} className={inputClass} />
      )}
    </FilterForm>
  );
}

export function AmountFilterPopover({ value, onChange }: { value: AmountFilter; onChange: (a: AmountFilter) => void }) {
  return (
    <FilterPill label="Amount" summary={amountSummary(value)} onClear={() => onChange({ op: "any" })}>
      {(close) => (
        <AmountForm
          value={value}
          onApply={(a) => {
            onChange(a);
            close();
          }}
        />
      )}
    </FilterPill>
  );
}
