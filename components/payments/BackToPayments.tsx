"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { DEFAULT_LIST_URL, readListUrl } from "@/lib/payments/lastListUrl";

/** Breadcrumb back to the list the user came from; the saved URL is read after mount to avoid a hydration mismatch. */
export function BackToPayments({ className, children }: { className: string; children: ReactNode }) {
  const [href, setHref] = useState(DEFAULT_LIST_URL);
  useEffect(() => setHref(readListUrl()), []);
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
