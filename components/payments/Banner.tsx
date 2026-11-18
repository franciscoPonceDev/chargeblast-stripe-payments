"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";

export function Banner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="flex items-center gap-2 rounded-md bg-bg-subtle px-3 py-2 text-body text-text-primary">
      <span className="inline-flex items-center gap-1 rounded-sm bg-badge-neutral-bg px-1 text-xs font-semibold text-badge-neutral-fg">
        <Icon name="info" size={12} />
        New
      </span>
      <span className="min-w-0 flex-1">Rule Attributes are now in Sigma and Data Pipeline for better fraud insights.</span>
      <button type="button" className="cursor-pointer font-semibold text-brand hover:text-brand-hover">
        Get started
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setOpen(false)}
        className="inline-flex cursor-pointer text-text-muted hover:text-text-primary"
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}
