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
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-primary">
        <Icon name="search" size={12} />
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
        className="h-9 w-full rounded-lg bg-bg-hover pr-3 pl-8 text-body text-text-primary placeholder:text-text-secondary focus-visible:shadow-focus"
      />
    </div>
  );
}
