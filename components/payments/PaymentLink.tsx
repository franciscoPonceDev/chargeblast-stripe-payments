"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

// Perf: viewport prefetch of 25-100 detail routes per page costs main-thread time and bandwidth on first load;
// prefetch only on hover, focus or touch, when the user is likely to open that payment.
export function PaymentLink({ href, onMouseEnter, onFocus, onTouchStart, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();
  const warm = () => router.prefetch?.(href);
  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={(e) => {
        warm();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        warm();
        onTouchStart?.(e);
      }}
      {...rest}
    />
  );
}
