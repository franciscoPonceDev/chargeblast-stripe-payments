"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";

export function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitted = useRef(value);

  useEffect(() => {
    if (value === emitted.current) return;
    if (timer.current) clearTimeout(timer.current);
    emitted.current = value;
    setLocal(value);
  }, [value]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-text-muted">
        <Icon name="search" size={14} />
      </span>
      <input
        type="text"
        aria-label="Search"
        placeholder="Search"
        value={local}
        onChange={(e) => {
          const v = e.target.value;
          setLocal(v);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => {
            emitted.current = v;
            onChange(v);
          }, 200);
        }}
        className="h-(--size-control-md) w-full rounded-md border border-border bg-surface pr-2 pl-7 text-body text-text-primary outline-transparent placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-brand-ring"
      />
    </div>
  );
}
