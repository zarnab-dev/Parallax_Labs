import type { FieldErrors, PaymentInfo, ShippingInfo } from "./checkoutTypes";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateShipping(data: ShippingInfo): FieldErrors<ShippingInfo> {
  const errors: FieldErrors<ShippingInfo> = {};

  if (!data.fullName.trim()) errors.fullName = "Full name is required.";
  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!data.address.trim()) errors.address = "Address is required.";
  if (!data.city.trim()) errors.city = "City is required.";
  if (!data.postalCode.trim()) {
    errors.postalCode = "Postal code is required.";
  } else if (!/^[A-Za-z0-9\s-]{3,10}$/.test(data.postalCode.trim())) {
    errors.postalCode = "Enter a valid postal code.";
  }
  if (!data.country.trim()) errors.country = "Country is required.";

  return errors;
}

export function validatePayment(data: PaymentInfo): FieldErrors<PaymentInfo> {
  const errors: FieldErrors<PaymentInfo> = {};
  const digitsOnly = data.cardNumber.replace(/\s+/g, "");

  if (!data.cardName.trim()) errors.cardName = "Name on card is required.";

  if (!digitsOnly) {
    errors.cardNumber = "Card number is required.";
  } else if (!/^\d{13,19}$/.test(digitsOnly)) {
    errors.cardNumber = "Enter a valid card number.";
  }

  if (!data.expiry.trim()) {
    errors.expiry = "Expiry is required.";
  } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiry.trim())) {
    errors.expiry = "Use MM/YY format.";
  } else {
    const [month, year] = data.expiry.split("/").map(Number);
    const expiryDate = new Date(2000 + (year ?? 0), month ?? 0, 1);
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    if (expiryDate < currentMonthStart) {
      errors.expiry = "Card has expired.";
    }
  }

  if (!data.cvc.trim()) {
    errors.cvc = "CVC is required.";
  } else if (!/^\d{3,4}$/.test(data.cvc.trim())) {
    errors.cvc = "Enter a valid CVC.";
  }

  return errors;
}

export function hasErrors(errors: FieldErrors<unknown>): boolean {
  return Object.keys(errors).length > 0;
}
