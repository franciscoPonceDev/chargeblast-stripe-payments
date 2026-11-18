"use client";

import { STATUS_LABELS } from "@/lib/payments/query";
import type { PaymentStatus } from "@/lib/payments/types";
import { MultiSelectFilter, type Option } from "./MultiSelectFilter";

const STATUS_OPTIONS: Option<PaymentStatus>[] = (Object.keys(STATUS_LABELS) as PaymentStatus[]).map((s) => ({
  value: s,
  label: STATUS_LABELS[s],
}));

export function StatusFilterPopover({ value, onChange }: { value: PaymentStatus[]; onChange: (v: PaymentStatus[]) => void }) {
  return <MultiSelectFilter label="Status" options={STATUS_OPTIONS} value={value} onChange={onChange} />;
}
