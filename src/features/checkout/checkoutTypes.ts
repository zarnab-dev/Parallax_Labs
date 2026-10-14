export interface ShippingInfo {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentInfo {
  cardName: string;
  cardNumber: string;
  expiry: string; // MM/YY
  cvc: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export type CheckoutEvent =
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SUBMIT_SHIPPING"; data: ShippingInfo }
  | { type: "SUBMIT_PAYMENT"; data: PaymentInfo };

export interface CheckoutContext {
  shipping: ShippingInfo | null;
  payment: PaymentInfo | null;
  orderId: string | null;
  paymentError: string | null;
}
