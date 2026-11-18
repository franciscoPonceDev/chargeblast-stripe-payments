"use client";

import type { KeyboardEvent } from "react";
import clsx from "clsx";
import type { StatusTab } from "@/lib/payments/query";

const TABS: { id: StatusTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "succeeded", label: "Succeeded" },
  { id: "refunded", label: "Refunded" },
  { id: "disputed", label: "Disputed" },
  { id: "failed", label: "Failed" },
  { id: "uncaptured", label: "Uncaptured" },
];

export function StatusTabs({ value, onChange }: { value: StatusTab; onChange: (t: StatusTab) => void }) {
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.id === value);
    const idx = (i + dir + TABS.length) % TABS.length;
    onChange(TABS[idx].id);
    e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[idx]?.focus();
  }

  return (
    <div role="tablist" aria-label="Payment status" onKeyDown={onKeyDown} className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {TABS.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={clsx(
              "cursor-pointer rounded-md border bg-surface px-3 py-2 text-left text-body outline-transparent focus-visible:ring-2 focus-visible:ring-brand-ring",
              selected
                ? "border-brand text-brand font-semibold shadow-[inset_0_0_0_1px_var(--color-brand)]"
                : "border-border text-text-secondary hover:bg-bg-hover",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
