import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd, breadcrumbLd } from "@/components/seo/JsonLd";
import { getSiteUrl, SITE_NAME } from "@/lib/seo";
import { DetailsShell } from "@/components/payments/DetailsShell";
import { PaymentDetails } from "@/components/payments/PaymentDetails";
import { shortenId } from "@/lib/format";
import { ALL_PAYMENTS } from "@/lib/payments/data";
import { MOCK_NOW } from "@/lib/payments/generate";

export const dynamicParams = false;

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return ALL_PAYMENTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const title = `Payment ${shortenId(id)}`;
  const path = `/payments/${id}`;
  return {
    title,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", title, url: path },
    twitter: { card: "summary_large_image", title },
  };
}

export default async function PaymentPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const payment = ALL_PAYMENTS.find((p) => p.id === id);
  if (!payment) notFound();
  return (
    <DetailsShell>
      <JsonLd
        data={breadcrumbLd([
          { name: "Payments", url: `${getSiteUrl()}/payments` },
          { name: `Payment ${shortenId(id)}`, url: `${getSiteUrl()}/payments/${id}` },
        ])}
      />
      <PaymentDetails payment={payment} now={MOCK_NOW} />
    </DetailsShell>
  );
}
