import { Tooltip } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { RelativeTime } from "./RelativeTime";

export function CreatedCell({ created, now }: { created: number; now: number }) {
  return (
    <Tooltip content={<RelativeTime ms={created} now={now} />}>
      <span>{formatDateTime(created, now)}</span>
    </Tooltip>
  );
}
