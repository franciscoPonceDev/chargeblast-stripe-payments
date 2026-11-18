import { PaymentsView } from "@/components/payments/PaymentsView";
import { ALL_PAYMENTS, DATA_VERSION } from "@/lib/payments/data";
import { MOCK_NOW } from "@/lib/payments/generate";
import { applyQuery, DEFAULT_QUERY, tabCounts } from "@/lib/payments/query";

export default function PaymentsPage() {
  const { rows, total } = applyQuery(ALL_PAYMENTS, DEFAULT_QUERY, MOCK_NOW);
  return (
    <PaymentsView
      initialRows={rows}
      initialTotal={total}
      counts={tabCounts(ALL_PAYMENTS)}
      now={MOCK_NOW}
      dataVersion={DATA_VERSION}
    />
  );
}
