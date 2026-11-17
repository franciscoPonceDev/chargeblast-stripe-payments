import { Tooltip } from "@/components/ui";
import { formatDateTime, formatRelative } from "@/lib/format";

export function CreatedCell({ created, now }: { created: number; now: number }) {
  return (
    <Tooltip content={formatRelative(created, now)}>
      <span>{formatDateTime(created, now)}</span>
    </Tooltip>
  );
}
