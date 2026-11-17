export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'refunded' | 'canceled' | 'blocked';
export type MethodType = 'card' | 'ach' | 'wallet';
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover';
export type WalletKind = 'apple_pay' | 'google_pay' | 'link';
export type Currency = 'usd' | 'gbp' | 'eur' | 'brl' | 'cad' | 'jpy';

export interface PaymentMethod {
  type: MethodType;
  brand: CardBrand | null;
  wallet: WalletKind | null;
  bankName: string | null;
  last4: string;
}

export interface Payment {
  id: string; // 'pi_' + 24 base62 chars
  amount: number; // minor units (JPY: whole yen)
  currency: Currency;
  status: PaymentStatus;
  disputed: boolean;
  method: PaymentMethod;
  description: string; // mostly 'Subscription update'
  customerEmail: string;
  customerName: string;
  created: number; // unix ms
  refundedAt: number | null;
  declineReason: string | null; // only for failed/blocked
}
