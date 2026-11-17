import type { CardBrand, WalletKind } from "@/lib/payments/types";

const BRANDS: Record<CardBrand, { text: string; cls: string }> = {
  visa: { text: "VISA", cls: "bg-mark-visa text-on-brand" },
  mastercard: { text: "MC", cls: "bg-mark-mastercard text-on-brand" },
  amex: { text: "AMEX", cls: "bg-mark-amex text-on-brand" },
  discover: { text: "DISC", cls: "bg-mark-discover text-on-brand" },
};

const WALLETS: Record<WalletKind, { text: string; cls: string; label: string }> = {
  apple_pay: { text: "Pay", cls: "bg-mark-apple text-on-brand", label: "Apple Pay" },
  google_pay: { text: "G Pay", cls: "bg-mark-google text-text-primary border border-border", label: "Google Pay" },
  link: { text: "›", cls: "bg-mark-link text-text-primary", label: "Link" },
};

const BASE =
  "inline-flex h-4 w-6 shrink-0 items-center justify-center rounded-sm text-mark font-bold leading-none";

export function BrandMark({ brand }: { brand: CardBrand }) {
  const b = BRANDS[brand];
  return (
    <span className={`${BASE} ${b.cls}`} role="img" aria-label={brand}>
      {b.text}
    </span>
  );
}

export function WalletMark({ wallet }: { wallet: WalletKind }) {
  const w = WALLETS[wallet];
  return (
    <span className={`${BASE} ${w.cls}`} role="img" aria-label={w.label}>
      {w.text}
    </span>
  );
}
