import clsx from "clsx";
import { Button } from "@/components/ui";

const SECTIONS = ["Payments", "Payouts", "Top-ups", "Collected fees", "Transfers", "All activity"];

export function PageHeader() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-(--space-page-top) pb-3">
        <h1 className="text-h1 font-bold text-text-primary">Transactions</h1>
        <div className="flex items-center gap-2">
          <Button variant="primary" icon="plus">Create payment</Button>
          <Button variant="secondary" icon="chart">Analyze</Button>
        </div>
      </div>
      <nav aria-label="Transactions sections" className="flex gap-4 overflow-x-auto border-b border-border">
        {SECTIONS.map((s, i) => (
          <button
            key={s}
            type="button"
            aria-current={i === 0 ? "page" : undefined}
            className={clsx(
              "-mb-px cursor-pointer whitespace-nowrap border-b-2 py-2 text-body outline-transparent focus-visible:ring-2 focus-visible:ring-brand-ring",
              i === 0
                ? "border-brand font-semibold text-brand"
                : "border-transparent font-medium text-text-secondary hover:text-text-primary",
            )}
          >
            {s}
          </button>
        ))}
      </nav>
    </>
  );
}
