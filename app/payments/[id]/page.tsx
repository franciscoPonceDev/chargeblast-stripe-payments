import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  return { title: `Payment ${shortenId(id)}` };
}

export default async function PaymentPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const payment = ALL_PAYMENTS.find((p) => p.id === id);
  if (!payment) notFound();
  return (
    <DetailsShell>
      <PaymentDetails payment={payment} now={MOCK_NOW} />
    </DetailsShell>
  );
}
