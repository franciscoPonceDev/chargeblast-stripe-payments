import { Icon, type IconName } from "@/components/ui";

const ACTIONS: { label: string; icon: IconName; round: string }[] = [
  { label: "Refund payment", icon: "refund", round: "rounded-l-md" },
  { label: "Send receipt", icon: "mail", round: "" },
  { label: "More actions", icon: "more", round: "rounded-r-md" },
];

/**
 * Last-column row actions. At rest only the "..." button shows; on row hover or
 * focus-within it is replaced by Stripe's joined 28x28 icon-button group.
 * The buttons are inert (no handlers) by design.
 */
export function RowActions() {
  return (
    <>
      <button
        type="button"
        aria-label="More options"
        className="inline-flex size-(--size-control-sm) cursor-pointer items-center justify-center rounded-sm text-text-muted group-focus-within:opacity-0 group-hover:opacity-0"
      >
        <Icon name="more" size={16} />
      </button>
      <div
        role="group"
        aria-label="Row actions"
        className="pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 items-stretch rounded-md border border-border bg-surface opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100"
      >
        {ACTIONS.map((a, i) => (
          <button
            key={a.label}
            type="button"
            aria-label={a.label}
            className={`inline-flex size-7 cursor-pointer items-center justify-center text-control hover:bg-bg-hover ${a.round} ${i > 0 ? "border-l border-border" : ""}`}
          >
            <Icon name={a.icon} size={a.icon === "more" ? 14 : 12} />
          </button>
        ))}
      </div>
    </>
  );
}
