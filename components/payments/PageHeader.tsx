import clsx from "clsx";
import { Button } from "@/components/ui";

const SECTIONS = ["Payments", "Payouts", "Top-ups", "Collected fees", "Transfers", "All activity"];

export function PageHeader() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-(--space-page-top) pb-1">
        <h1 className="text-h1 font-bold text-text-primary">Transactions</h1>
        <div className="flex items-center gap-2">
          <Button variant="primary" icon="plus">Create payment</Button>
          <Button variant="secondary" icon="chart">Analyze</Button>
        </div>
      </div>
      <nav aria-label="Transactions sections" className="flex overflow-x-auto border-b border-border">
        {SECTIONS.map((s, i) => (
          <button
            key={s}
            type="button"
            aria-current={i === 0 ? "page" : undefined}
            className={clsx(
              "relative h-9 cursor-pointer whitespace-nowrap px-3 text-body font-semibold first:-ml-3",
              i === 0
                ? "text-text-primary after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-text-primary"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {s}
          </button>
        ))}
      </nav>
    </>
  );
}
