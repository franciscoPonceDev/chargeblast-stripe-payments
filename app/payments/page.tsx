import { PaymentsView } from "@/components/payments/PaymentsView";
import { ALL_PAYMENTS, DATA_VERSION } from "@/lib/payments/data";
import { MOCK_NOW } from "@/lib/payments/generate";
import { applyQuery, tabCounts } from "@/lib/payments/query";
import { parseQuery } from "@/lib/payments/url";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Trade-off: reading searchParams makes this route dynamic; correct first paint for shared links beats static HTML.
  const parsed =parseQuery((await searchParams) ?? {});
  const { rows, total, page } = applyQuery(ALL_PAYMENTS, parsed, MOCK_NOW);
  return (
    <PaymentsView
      initialRows={rows}
      initialTotal={total}
      initialQuery={{ ...parsed, page }}
      counts={tabCounts(ALL_PAYMENTS)}
      now={MOCK_NOW}
      dataVersion={DATA_VERSION}
    />
  );
}
