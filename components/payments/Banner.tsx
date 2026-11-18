"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";

export function Banner({ onDismiss }: { onDismiss?: () => void }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="flex items-center gap-2 rounded-md bg-bg-subtle px-3 py-2 text-body text-text-primary">
      <span className="inline-flex items-center gap-1 rounded-sm bg-badge-neutral-bg px-1 text-caption font-semibold text-badge-neutral-fg">
        <Icon name="info" size={12} />
        New
      </span>
      <span className="min-w-0 flex-1">Rule Attributes are now in Sigma and Data Pipeline for better fraud insights.</span>
      <button type="button" className="cursor-pointer rounded-sm font-semibold text-brand outline-transparent hover:text-brand-hover focus-visible:ring-2 focus-visible:ring-brand-ring">
        Get started
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          setOpen(false);
          onDismiss?.();
        }}
        className="inline-flex size-6 cursor-pointer items-center justify-center rounded-sm text-text-muted outline-transparent hover:text-text-primary focus-visible:ring-2 focus-visible:ring-brand-ring"
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}
