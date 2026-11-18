"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";

export function Banner({ onDismiss }: { onDismiss?: () => void }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="flex items-center gap-4 rounded-lg bg-bg-subtle p-4 text-body text-text-secondary">
      <span className="inline-flex items-center gap-1 rounded-sm bg-border-row px-1.5 text-caption leading-4 font-semibold text-text-secondary">
        <Icon name="info" size={12} />
        New
      </span>
      <span className="min-w-0 flex-1">Rule Attributes are now in Sigma and Data Pipeline for better fraud insights.</span>
      <button type="button" className="ml-8 cursor-pointer rounded-sm text-brand hover:text-brand-hover">
        Get started
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          setOpen(false);
          onDismiss?.();
        }}
        className="-mr-2 inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-brand-subtle hover:bg-border-row"
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}
