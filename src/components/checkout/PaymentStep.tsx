"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { PaymentInfo } from "@/features/checkout/checkoutTypes";
import { hasErrors, validatePayment } from "@/features/checkout/checkoutValidation";

interface PaymentStepProps {
  initialValue: PaymentInfo | null;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (data: PaymentInfo) => void;
  onBack: () => void;
}

const EMPTY: PaymentInfo = { cardName: "", cardNumber: "", expiry: "", cvc: "" };

export function PaymentStep({
  initialValue,
  isSubmitting,
  submitError,
  onSubmit,
  onBack,
}: PaymentStepProps) {
  const [data, setData] = useState<PaymentInfo>(initialValue ?? EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validatePayment>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validatePayment(data);
    setErrors(validation);
    if (!hasErrors(validation)) {
      onSubmit(data);
    }
  }

  function field(key: keyof PaymentInfo, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {submitError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
        >
          {submitError}
        </p>
      )}

      <Input
        label="Name on card"
        value={data.cardName}
        onChange={(e) => field("cardName", e.target.value)}
        error={errors.cardName}
        autoComplete="cc-name"
      />
      <Input
        label="Card number"
        inputMode="numeric"
        placeholder="4242 4242 4242 4242"
        value={data.cardNumber}
        onChange={(e) => field("cardNumber", e.target.value)}
        error={errors.cardNumber}
        autoComplete="cc-number"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Expiry (MM/YY)"
          placeholder="MM/YY"
          value={data.expiry}
          onChange={(e) => field("expiry", e.target.value)}
          error={errors.expiry}
          autoComplete="cc-exp"
        />
        <Input
          label="CVC"
          inputMode="numeric"
          value={data.cvc}
          onChange={(e) => field("cvc", e.target.value)}
          error={errors.cvc}
          autoComplete="cc-csc"
        />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        This is a mock checkout — no real payment is processed. Use any test
        card number; use <span className="font-mono">4000 0000 0000 0002</span> to
        see a simulated decline.
      </p>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button type="submit" className="flex-1" isLoading={isSubmitting}>
          {isSubmitting ? "Processing…" : "Pay & place order"}
        </Button>
      </div>
    </form>
  );
}
