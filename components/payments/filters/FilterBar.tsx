"use client";

import { useState } from "react";
import type { PaymentsQuery } from "@/lib/payments/query";
import { AmountFilterPopover } from "./AmountFilterPopover";
import { DateFilterPopover } from "./DateFilterPopover";
import { FilterForm, FilterPill, inputClass } from "./FilterPill";
import {
  CurrencyFilterPopover,
  MethodFilterPopover,
  StatusFilterPopover,
} from "./StatusFilterPopover";

function SearchForm({ value, onApply }: { value: string; onApply: (s: string) => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <FilterForm title="Filter by more filters" canApply onApply={() => onApply(draft.trim())}>
      <label className="flex flex-col gap-1 text-xs text-text-secondary">
        Search
        <input
          type="text"
          placeholder="Payment ID, email or card last 4"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={inputClass}
        />
      </label>
    </FilterForm>
  );
}

export function FilterBar({
  query,
  onChange,
}: {
  query: PaymentsQuery;
  onChange: (patch: Partial<PaymentsQuery>) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <DateFilterPopover value={query.date} onChange={(date) => onChange({ date })} />
      <AmountFilterPopover value={query.amount} onChange={(amount) => onChange({ amount })} />
      <CurrencyFilterPopover value={query.currencies} onChange={(currencies) => onChange({ currencies })} />
      <StatusFilterPopover value={query.statuses} onChange={(statuses) => onChange({ statuses })} />
      <MethodFilterPopover value={query.methods} onChange={(methods) => onChange({ methods })} />
      <FilterPill label="More filters" summary={query.search || null} onClear={() => onChange({ search: "" })}>
        {(close) => (
          <SearchForm
            value={query.search}
            onApply={(search) => {
              onChange({ search });
              close();
            }}
          />
        )}
      </FilterPill>
    </div>
  );
}
