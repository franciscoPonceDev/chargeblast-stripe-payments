import { Icon } from "@/components/ui";
import type { PaymentMethod } from "@/lib/payments/types";
import { BrandMark, WalletMark } from "./BrandMark";

export function PaymentMethodCell({ method }: { method: PaymentMethod }) {
  return (
    <span className="inline-flex items-center gap-2">
      {method.type === "ach" ? (
        <Icon name="bank" size={16} className="text-text-muted" />
      ) : (
        <>
          {method.wallet && <WalletMark wallet={method.wallet} />}
          {method.brand && <BrandMark brand={method.brand} />}
        </>
      )}
      <span className="tabular-nums">•••• {method.last4}</span>
    </span>
  );
}
