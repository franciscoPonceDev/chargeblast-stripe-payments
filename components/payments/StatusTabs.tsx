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
              "h-(--size-card) cursor-pointer rounded-lg bg-surface px-3 text-left text-body focus-visible:shadow-focus",
              selected
                ? "border-2 border-brand px-[calc(var(--spacing)*3-1px)] font-semibold text-brand"
                : "border border-border-row font-normal text-text-secondary hover:bg-bg-hover",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
