import type { ComponentType, SVGProps } from "react";
import { VisaFlatRoundedIcon } from "react-svg-credit-card-payment-icons/visa";
import { MastercardFlatRoundedIcon } from "react-svg-credit-card-payment-icons/mastercard";
import { AmericanExpressFlatRoundedIcon } from "react-svg-credit-card-payment-icons/americanexpress";
import { DiscoverFlatRoundedIcon } from "react-svg-credit-card-payment-icons/discover";
import type { CardBrand } from "@/lib/payments/types";
import { spriteId } from "./brandIds";

// Card art: react-svg-credit-card-payment-icons (MIT/Apache-2.0). See THIRD_PARTY_NOTICES.md.
const CARDS: Record<CardBrand, ComponentType<SVGProps<SVGSVGElement>>> = {
  visa: VisaFlatRoundedIcon,
  mastercard: MastercardFlatRoundedIcon,
  amex: AmericanExpressFlatRoundedIcon,
  discover: DiscoverFlatRoundedIcon,
};

// Perf: each brand's artwork is 1.5-5 KB of SVG. Inlining it per row put ~140 KB (45% of the HTML) and ~2,800 nodes
// in the /payments document. Every brand is rendered once here, in a Server Component (so the icon package stays out of
// the client bundle), and rows reference it with <use>. Render once on any page that shows BrandMark.
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
