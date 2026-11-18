import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SITE_NAME } from "@/lib/seo";
import { BrandSprite } from "@/components/payments/BrandSprite";
import { PaymentsView } from "@/components/payments/PaymentsView";
import { ALL_PAYMENTS, DATA_VERSION } from "@/lib/payments/data";
import { MOCK_NOW } from "@/lib/payments/generate";
import { applyQuery, tabCounts } from "@/lib/payments/query";
import { BANNER_COOKIE, parseVariant } from "@/lib/experiments";
import { parseQuery } from "@/lib/payments/url";
import { settingsScript } from "@/lib/payments/tableSettingsConfig";

export const metadata: Metadata = {
  title: "Transactions",
  alternates: { canonical: "/payments" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", title: "Transactions", url: "/payments" },
  twitter: { card: "summary_large_image", title: "Transactions" },
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Trade-off: reading searchParams makes this route dynamic; correct first paint for shared links beats static HTML.
  const parsed = parseQuery((await searchParams) ?? {});
  const { rows, total, page } = applyQuery(ALL_PAYMENTS, parsed, MOCK_NOW);
  // The cookie is assigned in middleware.ts, so the banner copy is correct on the first server render.
  const bannerVariant = parseVariant((await cookies()).get(BANNER_COOKIE)?.value) ?? "a";
  return (
    <>
      <BrandSprite />
      {/* Trade-off: tiny inline script applies saved column settings before first paint (no layout shift); needs CSP 'unsafe-inline'. */}
      <script dangerouslySetInnerHTML={{ __html: settingsScript() }} />
      <PaymentsView
        initialRows={rows}
        initialTotal={total}
        initialQuery={{ ...parsed, page }}
        counts={tabCounts(ALL_PAYMENTS)}
        now={MOCK_NOW}
        dataVersion={DATA_VERSION}
        bannerVariant={bannerVariant}
      />
    </>
  );
}
