import { APPLE_PAY_PATH, GOOGLE_PAY_PATH } from "./walletGlyphs";
import type { CardBrand, WalletKind } from "@/lib/payments/types";
import { spriteId } from "./brandIds";

// Card art lives in BrandSprite (server-rendered once per page). Wallet glyphs: simple-icons path data (CC0-1.0). See THIRD_PARTY_NOTICES.md.

const BASE = "inline-flex align-middle h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-sm";

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
