"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ShippingInfo } from "@/features/checkout/checkoutTypes";
import { validateShipping, hasErrors } from "@/features/checkout/checkoutValidation";

interface ShippingStepProps {
  initialValue: ShippingInfo | null;
  onSubmit: (data: ShippingInfo) => void;
  onBack: () => void;
}

const EMPTY: ShippingInfo = {
  fullName: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
};

export function ShippingStep({ initialValue, onSubmit, onBack }: ShippingStepProps) {
  const [data, setData] = useState<ShippingInfo>(initialValue ?? EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validateShipping>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateShipping(data);
    setErrors(validation);
    if (!hasErrors(validation)) {
      onSubmit(data);
    }
  }

  function field(key: keyof ShippingInfo, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Full name"
        value={data.fullName}
        onChange={(e) => field("fullName", e.target.value)}
        error={errors.fullName}
        autoComplete="name"
      />
      <Input
        label="Email"
        type="email"
        value={data.email}
        onChange={(e) => field("email", e.target.value)}
        error={errors.email}
        autoComplete="email"
      />
      <Input
        label="Address"
        value={data.address}
        onChange={(e) => field("address", e.target.value)}
        error={errors.address}
        autoComplete="street-address"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          value={data.city}
          onChange={(e) => field("city", e.target.value)}
          error={errors.city}
          autoComplete="address-level2"
        />
        <Input
          label="Postal code"
          value={data.postalCode}
          onChange={(e) => field("postalCode", e.target.value)}
          error={errors.postalCode}
          autoComplete="postal-code"
        />
      </div>
      <Input
        label="Country"
        value={data.country}
        onChange={(e) => field("country", e.target.value)}
        error={errors.country}
        autoComplete="country-name"
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Continue to payment
        </Button>
      </div>
    </form>
  );
}
