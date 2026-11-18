"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { track } from "@/lib/analytics/events";
import { trackExposureOnce } from "@/lib/analytics/exposure";
import { BANNER_CTA, BANNER_EXPERIMENT, type Variant } from "@/lib/experiments";

export function Banner({ variant = "a", onDismiss }: { variant?: Variant; onDismiss?: () => void }) {
  const [open, setOpen] = useState(true);
  useEffect(() => trackExposureOnce(BANNER_EXPERIMENT, variant), [variant]);
  if (!open) return null;
  return (
    <div className="flex items-center gap-4 rounded-lg bg-bg-subtle p-4 text-body text-text-secondary">
      <span className="inline-flex items-center gap-1 rounded-sm bg-border-row px-1.5 text-caption leading-4 font-semibold text-text-secondary">
        <Icon name="sparkles" size={12} />
        New
      </span>
      <span className="min-w-0 flex-1">Rule Attributes are now in Sigma and Data Pipeline for better fraud insights.</span>
      <button
        type="button"
        onClick={() => track("banner_cta_clicked", { variant })}
        className="ml-8 cursor-pointer rounded-sm text-brand-text hover:text-brand-hover focus-visible:shadow-focus"
      >
        {BANNER_CTA[variant]}
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          track("banner_dismissed", {});
          setOpen(false);
          onDismiss?.();
        }}
        className="-mr-2 inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-brand hover:bg-border-row focus-visible:shadow-focus"
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}
