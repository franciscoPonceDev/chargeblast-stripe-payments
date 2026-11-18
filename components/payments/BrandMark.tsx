import type { ComponentType, SVGProps } from "react";
import { VisaFlatRoundedIcon } from "react-svg-credit-card-payment-icons/visa";
import { MastercardFlatRoundedIcon } from "react-svg-credit-card-payment-icons/mastercard";
import { AmericanExpressFlatRoundedIcon } from "react-svg-credit-card-payment-icons/americanexpress";
import { DiscoverFlatRoundedIcon } from "react-svg-credit-card-payment-icons/discover";
import { APPLE_PAY_PATH, GOOGLE_PAY_PATH } from "./walletGlyphs";
import type { CardBrand, WalletKind } from "@/lib/payments/types";

// Card art: react-svg-credit-card-payment-icons (MIT/Apache-2.0).
// Wallet glyphs: simple-icons path data (CC0-1.0). See THIRD_PARTY_NOTICES.md.
const CARDS: Record<CardBrand, ComponentType<SVGProps<SVGSVGElement>>> = {
  visa: VisaFlatRoundedIcon,
  mastercard: MastercardFlatRoundedIcon,
  amex: AmericanExpressFlatRoundedIcon,
  discover: DiscoverFlatRoundedIcon,
};

const BASE = "inline-flex align-middle h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-sm";

export function BrandMark({ brand }: { brand: CardBrand }) {
  const Card = CARDS[brand];
  return (
    <span className={BASE} role="img" aria-label={brand}>
      <Card width={24} height={16} aria-hidden="true" />
    </span>
  );
}

function Glyph({ path, className }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  );
}

export function WalletMark({ wallet }: { wallet: WalletKind }) {
  if (wallet === "link") {
    // No open-license Link mark exists; keep a neutral brand-colored chip.
    return (
      <span className={`${BASE} bg-mark-link text-text-primary text-mark font-bold leading-none`} role="img" aria-label="Link">
        ›
      </span>
    );
  }
  const apple = wallet === "apple_pay";
  return (
    <span
      className={`${BASE} p-0.5 ${apple ? "bg-mark-apple text-mark-apple-fg" : "border border-border bg-surface text-text-primary"}`}
      role="img"
      aria-label={apple ? "Apple Pay" : "Google Pay"}
    >
      <Glyph path={apple ? APPLE_PAY_PATH : GOOGLE_PAY_PATH} className="h-full w-full" />
    </span>
  );
}
