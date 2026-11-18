"use client";

import { useState } from "react";
import type { Currency, MethodType } from "@/lib/payments/types";
import { Checkbox } from "@/components/ui";
import { FilterForm, FilterPill } from "./FilterPill";

export interface Option<T extends string> {
  value: T;
  label: string;
}

export function summarize(values: string[]): string | null {
  if (!values.length) return null;
  const head = values.slice(0, 2).join(", ");
  return values.length > 2 ? `${head} +${values.length - 2}` : head;
}

function MultiSelectForm<T extends string>({
  options,
  selected,
  onApply,
}: {
  options: Option<T>[];
  selected: T[];
  onApply: (v: T[]) => void;
}) {
  const [draft, setDraft] = useState<T[]>(selected);
  const toggle = (v: T, on: boolean) => setDraft((d) => (on ? [...d, v] : d.filter((x) => x !== v)));
  return (
    <FilterForm
      dense
      canApply
      onApply={() => onApply(options.map((o) => o.value).filter((v) => draft.includes(v)))}
    >
      {options.map((o) => (
        <label key={o.value} className="-mx-3 flex h-8 cursor-pointer items-center gap-2 rounded-sm px-3 text-body hover:bg-bg-hover">
          <Checkbox checked={draft.includes(o.value)} onCheckedChange={(on) => toggle(o.value, on)} aria-label={o.label} />
          {o.label}
        </label>
      ))}
    </FilterForm>
  );
}

export function MultiSelectFilter<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  value: T[];
  onChange: (v: T[]) => void;
}) {
  const labelOf = (v: T) => options.find((o) => o.value === v)?.label ?? v;
  return (
    <FilterPill label={label} summary={summarize(value.map(labelOf))} onClear={() => onChange([])}>
      {(close) => (
        <MultiSelectForm
          options={options}
          selected={value}
          onApply={(v) => {
            onChange(v);
            close();
          }}
        />
      )}
    </FilterPill>
  );
}

const METHOD_OPTIONS: Option<MethodType>[] = [
  { value: "card", label: "Card" },
  { value: "ach", label: "ACH" },
  { value: "wallet", label: "Wallet" },
];

export function MethodFilterPopover({ value, onChange }: { value: MethodType[]; onChange: (v: MethodType[]) => void }) {
  return <MultiSelectFilter label="Payment method" options={METHOD_OPTIONS} value={value} onChange={onChange} />;
}

const CURRENCY_OPTIONS: Option<Currency>[] = (["usd", "gbp", "eur", "brl", "cad", "jpy"] as const).map((c) => ({
  value: c,
  label: c.toUpperCase(),
}));

export function CurrencyFilterPopover({ value, onChange }: { value: Currency[]; onChange: (v: Currency[]) => void }) {
  return <MultiSelectFilter label="Currency" options={CURRENCY_OPTIONS} value={value} onChange={onChange} />;
}
