"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { Button, Icon, Popover } from "@/components/ui";

export const inputClass =
  "h-(--size-control-md) w-full rounded-md bg-surface px-2 text-body text-text-primary shadow-ring";

interface FilterPillProps {
  label: string;
  /** null/empty = unset */
  summary: string | null;
  onClear: () => void;
  /** Popover heading; defaults to "Filter by <label lowercase>" */
  title?: string;
  children: (close: () => void) => ReactNode;
}

export function FilterPill({ label, summary, onClear, title, children }: FilterPillProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const set = !!summary;
  const heading = title ?? `Filter by ${label.toLowerCase()}`;

  return (
    <div
      className={clsx(
        "inline-flex h-(--size-control-md) items-center rounded-lg text-caption leading-4 font-semibold text-control",
        set && "border border-border bg-surface",
      )}
    >
      {set && (
        <button
          type="button"
          aria-label={`Clear ${label} filter`}
          onClick={() => {
            onClear();
            triggerRef.current?.focus();
          }}
          className="ml-1 flex size-4 cursor-pointer items-center justify-center rounded-full hover:bg-bg-hover"
        >
          <Icon name="x" size={10} />
        </button>
      )}
      <Popover
        open={open}
        onOpenChange={setOpen}
        aria-labelledby={titleId}
        className="w-[320px] p-3"
        trigger={
          <button
            ref={triggerRef}
            type="button"
            className={clsx(
              "flex h-full cursor-pointer items-center gap-2 outline-transparent",
              set
                ? "rounded-r-lg pr-2 pl-1"
                : "rounded-lg border border-dashed border-border bg-surface px-2 enabled:hover:bg-bg-hover",
            )}
          >
            {!set && <Icon name="circle-plus" />}
            <span>{label}</span>
            {set && (
              <>
                <span aria-hidden="true" className="h-3 w-px shrink-0 bg-border" />
                <span className="max-w-[16rem] truncate text-brand">{summary}</span>
              </>
            )}
          </button>
        }
      >
        <h2 id={titleId} className="mb-3 text-body font-semibold">
          {heading}
        </h2>
        {children(() => setOpen(false))}
      </Popover>
    </div>
  );
}

/** Popover body: controls + full-width Apply. Mounted only while open, so draft state resets on close. */
export function FilterForm({
  canApply,
  onApply,
  dense,
  children,
}: {
  canApply: boolean;
  onApply: () => void;
  /** List-style body (radio/checkbox rows) with no gap between rows. */
  dense?: boolean;
  children: ReactNode;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canApply) onApply();
      }}
    >
      <div className={clsx("flex flex-col", !dense && "gap-2")}>{children}</div>
      <div className="mt-3">
        <Button type="submit" variant="primary" className="w-full" disabled={!canApply}>
          Apply
        </Button>
      </div>
    </form>
  );
}
