import { Icon, type IconName } from "@/components/ui";
import { STATUS_LABELS } from "@/lib/payments/query";
import type { PaymentStatus } from "@/lib/payments/types";

const STYLE: Record<PaymentStatus, { cls: string; icon: IconName }> = {
  succeeded: { cls: "border-badge-success-border bg-badge-success-bg text-badge-success-fg", icon: "check" },
  pending: { cls: "border-badge-neutral-border bg-badge-neutral-bg text-badge-neutral-fg", icon: "clock" },
  failed: { cls: "border-badge-danger-border bg-badge-danger-bg text-badge-danger-fg", icon: "x" },
  refunded: { cls: "border-badge-neutral-border bg-badge-neutral-bg text-badge-neutral-fg", icon: "refund" },
  canceled: { cls: "border-badge-neutral-border bg-badge-neutral-bg text-badge-neutral-fg", icon: "x" },
  blocked: { cls: "border-badge-danger-border bg-badge-danger-bg text-badge-danger-fg", icon: "ban" },
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const s = STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-0.5 whitespace-nowrap rounded-sm border px-1.5 py-px text-caption leading-4 font-normal ${s.cls}`}
    >
      {STATUS_LABELS[status]}
      <Icon name={s.icon} size={12} />
    </span>
  );
}
