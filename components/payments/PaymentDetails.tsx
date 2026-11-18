import Link from "next/link";
import type { ReactNode } from "react";
import { Button, Icon } from "@/components/ui";
import { currencyCode, formatAmount, formatDateTime } from "@/lib/format";
import { feeFor, metadataFor, netFor, statementDescriptor } from "@/lib/payments/details";
import { STATUS_LABELS } from "@/lib/payments/query";
import { buildTimeline } from "@/lib/payments/timeline";
import type { Payment, PaymentMethod } from "@/lib/payments/types";
import { BrandSprite } from "./BrandSprite";
import { CopyIdButton } from "./CopyIdButton";
import { PaymentMethodCell } from "./PaymentMethodCell";
import { StatusBadge } from "./StatusBadge";
import { Timeline } from "./Timeline";

const WALLETS = { apple_pay: "Apple Pay", google_pay: "Google Pay", link: "Link" } as const;

function methodKind(m: PaymentMethod): string {
  if (m.type === "ach") return m.bankName ? `ACH debit, ${m.bankName}` : "ACH debit";
  if (m.type === "wallet" && m.wallet) return WALLETS[m.wallet];
  return "Card";
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-8">
      <h2 id={id} className="text-body font-bold text-text-primary">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 border-b border-border-row py-2.5 sm:grid-cols-[200px_1fr]">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="m-0 min-w-0 break-words text-text-primary">{children}</dd>
    </div>
  );
}

export function PaymentDetails({ payment: p, now }: { payment: Payment; now: number }) {
  const money = (n: number) => `${formatAmount(n, p.currency)} ${currencyCode(p.currency)}`;
  const metadata = metadataFor(p.id);
  return (
    <div className="max-w-4xl">
      {p.method.brand && <BrandSprite brands={[p.method.brand]} />}
      <nav aria-label="Breadcrumb" className="mt-(--space-page-top)">
        <Link
          href="/payments"
          className="inline-flex items-center gap-1 rounded-sm text-body font-semibold text-text-secondary hover:text-text-primary focus-visible:shadow-focus"
        >
          <Icon name="chevron-down" size={12} className="rotate-90" />
          Payments
        </Link>
      </nav>
      <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="flex items-baseline gap-2 text-h1 font-bold text-text-primary">
              <span className="tabular-nums">{formatAmount(p.amount, p.currency)}</span>
              <span className="text-body font-normal text-text-muted">{currencyCode(p.currency)}</span>
            </h1>
            <StatusBadge status={p.status} />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-text-secondary">
            <span>{formatDateTime(p.created, now)}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 font-mono text-caption">
              {p.id}
              <CopyIdButton id={p.id} visible />
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>Refund</Button>
          <Button aria-label="More actions">
            <Icon name="more" size={14} />
          </Button>
        </div>
      </header>

      <Section id="timeline-h" title="Timeline">
        <Timeline events={buildTimeline(p, now)} now={now} />
      </Section>

      <Section id="details-h" title="Payment details">
        <dl className="m-0 border-t border-border-row">
          <Row label="Amount">{money(p.amount)}</Row>
          <Row label="Fee">{money(feeFor(p))}</Row>
          <Row label="Net">{money(netFor(p))}</Row>
          <Row label="Status">{STATUS_LABELS[p.status]}</Row>
          <Row label="Description">{p.description}</Row>
          <Row label="Statement descriptor">
            <span className="font-mono text-caption">{statementDescriptor(p.description)}</span>
          </Row>
          <Row label="Customer">
            {p.customerName}
            <span className="block text-text-muted">{p.customerEmail}</span>
          </Row>
          <Row label="Payment method">
            <span className="inline-flex flex-wrap items-center gap-2">
              <PaymentMethodCell method={p.method} />
              <span className="text-text-muted">{methodKind(p.method)}</span>
            </span>
          </Row>
          {p.declineReason && <Row label="Decline reason">{p.declineReason}</Row>}
          {p.refundedAt && <Row label="Refunded date">{formatDateTime(p.refundedAt, now)}</Row>}
        </dl>
      </Section>

      <Section id="metadata-h" title="Metadata">
        {metadata.length === 0 ? (
          <p className="text-text-muted">No metadata</p>
        ) : (
          <dl className="m-0 border-t border-border-row">
            {metadata.map(([k, v]) => (
              <Row key={k} label={k}>
                <span className="font-mono text-caption">{v}</span>
              </Row>
            ))}
          </dl>
        )}
      </Section>
    </div>
  );
}
