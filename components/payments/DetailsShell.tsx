"use client";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { SearchInput } from "@/components/payments/filters/SearchInput";

const noop = () => {};

/** Client boundary for the details page: the shell needs a search node, and the input holds client state. */
export function DetailsShell({ children }: { children: ReactNode }) {
  return <AppShell search={<SearchInput value="" onChange={noop} />}>{children}</AppShell>;
}
