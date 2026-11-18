"use client";
import { useId } from "react";
import { Button, Checkbox, Popover } from "@/components/ui";
import { COLUMN_OPTIONS, type TableSettings } from "@/lib/payments/tableSettings";

export interface EditColumnsProps {
  settings: TableSettings;
  onColumnVisibleChange: (id: string, visible: boolean) => void;
  onWrapChange: (wrap: boolean) => void;
  onReset: () => void;
}

export function EditColumns({ settings, onColumnVisibleChange, onWrapChange, onReset }: EditColumnsProps) {
  const titleId = useId();
  const wrapId = useId();
  const columnsId = useId();
  return (
    <Popover
      align="end"
      aria-labelledby={titleId}
      className="max-h-[calc(100vh-72px)] w-[267px] overflow-y-auto py-2"
      trigger={<Button icon="gear">Edit columns</Button>}
    >
      <h2 id={titleId} className="border-b border-border px-4 pt-1 pb-3 text-body leading-5 font-semibold">
        Edit columns
      </h2>
      <div className="border-b border-border px-4 py-2">
        <div className="flex items-center justify-between py-1">
          <span id={wrapId} className="text-body leading-5">
            Wrap cells
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.wrap}
            aria-labelledby={wrapId}
            onClick={() => onWrapChange(!settings.wrap)}
            className={`relative h-[18px] w-[34px] shrink-0 cursor-pointer rounded-full shadow-ring focus-visible:shadow-ring-focus ${settings.wrap ? "bg-brand" : "bg-border-row"}`}
          >
            <span
              aria-hidden
              className={`absolute top-0.5 left-0.5 size-3.5 rounded-full bg-surface shadow-checkbox transition-transform ${settings.wrap ? "translate-x-4" : ""}`}
            />
          </button>
        </div>
      </div>
      <div role="group" aria-labelledby={columnsId} className="px-4 pt-2">
        <div id={columnsId} className="text-caption leading-5 font-bold text-text-secondary">
          Columns
        </div>
        {COLUMN_OPTIONS.map((c) => (
          <label key={c.id} className="flex h-8 items-center gap-2 py-1.5 pl-1 text-body leading-5">
            <Checkbox
              aria-label={c.label}
              checked={c.locked || !settings.hidden.includes(c.id)}
              disabled={c.locked}
              onCheckedChange={(v) => onColumnVisibleChange(c.id, v)}
            />
            {c.label}
          </label>
        ))}
      </div>
      <div className="px-2 pt-3.5">
        <button
          type="button"
          onClick={onReset}
          className="h-(--size-control-sm) w-full cursor-pointer rounded-md bg-surface px-2 text-caption leading-4 font-semibold text-control shadow-ring focus-visible:shadow-ring-focus enabled:hover:bg-bg-hover"
        >
          Reset to default
        </button>
      </div>
    </Popover>
  );
}
