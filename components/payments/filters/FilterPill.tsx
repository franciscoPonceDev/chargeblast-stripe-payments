"use client";

import { useState, type ReactNode } from "react";
import { Button, Icon, Popover } from "@/components/ui";

export const inputClass =
  "h-(--size-control-md) w-full rounded-md border border-border bg-surface px-2 text-body text-text-primary outline-transparent focus-visible:ring-2 focus-visible:ring-brand-ring";

interface FilterPillProps {
  label: string;
  /** null/empty = unset */
  summary: string | null;
  onClear: () => void;
  children: (close: () => void) => ReactNode;
}

export function FilterPill({ label, summary, onClear, children }: FilterPillProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const popoverProps = {
    open,
    onOpenChange: setOpen,
    "aria-label": `Filter by ${label.toLowerCase()}`,
    className: "w-[280px]",
  };

  if (!summary) {
    return (
      <Popover
        {...popoverProps}
        trigger={
          <Button variant="pill" icon="circle-plus">
            {label}
          </Button>
        }
      >
        {children(close)}
      </Popover>
    );
  }

  return (
    <div className="inline-flex h-(--size-control-sm) items-center rounded-full border border-border bg-surface text-xs text-text-secondary">
      <button
        type="button"
        aria-label={`Clear ${label} filter`}
        onClick={onClear}
        className="ml-1 flex size-4 cursor-pointer items-center justify-center rounded-full outline-transparent hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-brand-ring"
      >
        <Icon name="x" size={10} />
      </button>
      <Popover
        {...popoverProps}
        trigger={
          <button
            type="button"
            className="flex h-full cursor-pointer items-center gap-2 rounded-r-full pr-2 pl-1 outline-transparent focus-visible:ring-2 focus-visible:ring-brand-ring"
          >
            <span>{label}</span>
            <span aria-hidden="true" className="h-3 w-px bg-border" />
            <span className="text-brand">{summary}</span>
          </button>
        }
      >
        {children(close)}
      </Popover>
    </div>
  );
}

/** Popover body: title, controls, full-width Apply. Mounted only while open, so draft state resets on close. */
export function FilterForm({
  title,
  canApply,
  onApply,
  children,
}: {
  title: string;
  canApply: boolean;
  onApply: () => void;
  children: ReactNode;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canApply) onApply();
      }}
    >
      <div className="border-b border-border-row px-4 py-3 text-body font-semibold">{title}</div>
      <div className="flex flex-col gap-2 px-4 py-3">{children}</div>
      <div className="px-4 pb-4">
        <Button type="submit" variant="primary" className="w-full" disabled={!canApply}>
          Apply
        </Button>
      </div>
    </form>
  );
}
