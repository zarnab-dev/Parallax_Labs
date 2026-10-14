"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";

interface QuantityStepperProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
}

/**
 * Client-side validated quantity control: typing or stepping past the
 * available stock (or below 1) shows an inline error immediately, without
 * waiting for a round-trip — the machine-level guard is the source of
 * truth, this is the fast local feedback layer.
 */
export function QuantityStepper({
  value,
  max,
  onChange,
  label = "Quantity",
}: QuantityStepperProps) {
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  function commit(next: number) {
    if (Number.isNaN(next)) {
      setError("Enter a number.");
      return;
    }
    if (next < 1) {
      setError("Quantity must be at least 1.");
      return;
    }
    if (next > max) {
      setError(`Only ${max} available.`);
      onChange(max);
      return;
    }
    setError(null);
    onChange(next);
  }

  return (
    <div>
      <div className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 rounded-r-none px-0"
          onClick={() => commit(value - 1)}
          disabled={value <= 1}
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          −
        </Button>
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          value={value}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => commit(Number(e.target.value))}
          className="h-9 w-12 border-x border-gray-300 bg-transparent text-center text-sm
            focus-visible:outline-none dark:border-gray-700"
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 rounded-l-none px-0"
          onClick={() => commit(value + 1)}
          disabled={value >= max}
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          +
        </Button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
