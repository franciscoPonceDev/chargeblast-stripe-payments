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

// Perf: each brand's artwork is 1.5-5 KB of SVG. Inlining it per row put ~140 KB (45% of the HTML) and ~2,800 nodes
// in the /payments document, so every brand is rendered once in a hidden sprite and rows reference it with <use>.
const spriteId = (brand: CardBrand) => `card-${brand}`;

/** Render once on any page that shows BrandMark. */
export function BrandSprite() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="pointer-events-none absolute size-0 overflow-hidden">
      {(Object.keys(CARDS) as CardBrand[]).map((brand) => {
        const Card = CARDS[brand];
        return <Card key={brand} id={spriteId(brand)} width={24} height={16} />;
      })}
    </svg>
  );
}

export function BrandMark({ brand }: { brand: CardBrand }) {
  return (
    <span className={BASE} role="img" aria-label={brand}>
      <svg width={24} height={16} aria-hidden="true" focusable="false">
        <use href={`#${spriteId(brand)}`} width={24} height={16} />
      </svg>
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
    // Trade-off: Link has no open-license mark, so a neutral chip stands in; not pixel-faithful.
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
