"use client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { SearchInput } from "@/components/payments/filters/SearchInput";

const noop = () => {};

/** Client boundary for the details page. Enter in the search box jumps to the list filtered by that text. */
export function DetailsShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <AppShell
      search={
        <div
          onKeyDown={(e) => {
            if (e.key !== "Enter" || !(e.target instanceof HTMLInputElement)) return;
            const q = e.target.value.trim();
            if (q) router.push(`/payments?${new URLSearchParams({ q })}`);
          }}
        >
          <SearchInput value="" onChange={noop} />
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
