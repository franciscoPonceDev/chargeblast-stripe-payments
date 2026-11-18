"use client";

import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { appTz } from "@/lib/time";
import type { DateFilter } from "@/lib/payments/query";
import { FilterForm, FilterPill, inputClass } from "./FilterPill";

type Preset = "today" | "7d" | "30d" | "custom";
const PRESETS: { id: Preset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "custom", label: "Custom" },
];

function day(s: string | null): string | null {
  if (!s) return null;
  const d = parseISO(s, { in: appTz });
  return isValid(d) ? format(d, "MMM d", { in: appTz }) : null;
}

export function dateSummary(f: DateFilter): string | null {
  switch (f.preset) {
    case "all":
      return null;
    case "today":
      return "Today";
    case "7d":
      return "Last 7 days";
    case "30d":
      return "Last 30 days";
    case "custom": {
      const from = day(f.from);
      const to = day(f.to);
      if (from && to) return `${from} – ${to}`;
      if (from) return `From ${from}`;
      if (to) return `Until ${to}`;
      return null;
    }
  }
}

function DateForm({ value, onApply }: { value: DateFilter; onApply: (d: DateFilter) => void }) {
  const [preset, setPreset] = useState<Preset | null>(value.preset === "all" ? null : value.preset);
  const [from, setFrom] = useState(value.preset === "custom" ? (value.from ?? "") : "");
  const [to, setTo] = useState(value.preset === "custom" ? (value.to ?? "") : "");
  const canApply = preset !== null && (preset !== "custom" || !!from || !!to);
  return (
    <FilterForm
      dense
      canApply={canApply}
      onApply={() => {
        if (preset === "custom") {
          const [lo, hi] = from && to && from > to ? [to, from] : [from, to];
          onApply({ preset, from: lo || null, to: hi || null });
        }
        else if (preset) onApply({ preset });
      }}
    >
      {PRESETS.map((p) => (
        <label key={p.id} className="-mx-3 flex h-8 cursor-pointer items-center gap-2 rounded-sm px-3 text-body hover:bg-bg-hover">
          <input
            type="radio"
            name="date-preset"
            checked={preset === p.id}
            onChange={() => setPreset(p.id)}
            className="accent-brand"
          />
          {p.label}
        </label>
      ))}
      {preset === "custom" && (
        <div className="flex flex-col gap-2 pt-1">
          <label className="flex flex-col gap-1 text-xs text-text-secondary">
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-secondary">
            To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
          </label>
        </div>
      )}
    </FilterForm>
  );
}

export function DateFilterPopover({ value, onChange }: { value: DateFilter; onChange: (d: DateFilter) => void }) {
  return (
    <FilterPill label="Date and time" summary={dateSummary(value)} onClear={() => onChange({ preset: "all" })}>
      {(close) => (
        <DateForm
          value={value}
          onApply={(d) => {
            onChange(d);
            close();
          }}
        />
      )}
    </FilterPill>
  );
}
