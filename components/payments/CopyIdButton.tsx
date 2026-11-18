"use client";
import { useEffect, useRef, useState } from "react";
import { Icon, Tooltip } from "@/components/ui";

export function CopyIdButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    const c = navigator.clipboard;
    if (!c) return;
    try {
      await c.writeText(id);
      if (!mounted.current) return;
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (mounted.current) setCopied(false);
      }, 1500);
    } catch {
      /* rejected: do nothing */
    }
  }

  return (
    <span className="inline-flex items-center">
      <Tooltip content="Copy payment ID">
        <button
          type="button"
          aria-label="Copy payment ID"
          onClick={copy}
          className="inline-flex size-4 cursor-pointer items-center justify-center rounded-sm text-text-secondary opacity-0 hover:bg-border-row focus-visible:shadow-focus focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <Icon name="copy" size={12} />
        </button>
      </Tooltip>
      <span role="status" className={copied ? "ml-1 text-caption text-text-secondary" : "sr-only"}>
        {copied ? "Copied" : ""}
      </span>
    </span>
  );
}
