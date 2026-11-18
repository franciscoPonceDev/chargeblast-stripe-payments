import clsx from "clsx";
import { Tooltip } from "@/components/ui";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { TimelineEvent, TimelineTone } from "@/lib/payments/timeline";

const DOT: Record<TimelineTone, string> = {
  success: "bg-badge-success-fg",
  danger: "bg-badge-danger-fg",
  neutral: "bg-text-muted",
};

export function Timeline({ events, now }: { events: TimelineEvent[]; now: number }) {
  return (
    <ol className="m-0 list-none p-0">
      {events.map((e, i) => (
        <li key={e.key} className="relative flex gap-3 pb-5 last:pb-0">
          {i < events.length - 1 && (
            <span aria-hidden="true" className="absolute top-4 -bottom-0 left-[4.5px] w-px bg-border" />
          )}
          <span aria-hidden="true" className={clsx("mt-1.5 size-2.5 shrink-0 rounded-full ring-2 ring-surface", DOT[e.tone])} />
          <div className="min-w-0">
            <div className="font-semibold text-text-primary">{e.label}</div>
            {e.detail && <div className="text-caption text-text-muted">{e.detail}</div>}
            <Tooltip content={formatRelative(e.at, now)}>
              <time dateTime={new Date(e.at).toISOString()} className="text-caption text-text-secondary">
                {formatDateTime(e.at, now)}
              </time>
            </Tooltip>
          </div>
        </li>
      ))}
    </ol>
  );
}
