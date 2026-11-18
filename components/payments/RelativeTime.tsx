import { formatRelative } from "@/lib/format";

/** Tooltip body: only rendered while the tooltip is open, so rows do not pay for date math up front. */
export function RelativeTime({ ms, now }: { ms: number; now: number }) {
  return <>{formatRelative(ms, now)}</>;
}
