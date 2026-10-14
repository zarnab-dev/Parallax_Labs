import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hideLabel?: boolean;
  error?: string;
  leadingIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, hideLabel = false, error, leadingIcon, id, className = "", ...props },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={
              hideLabel
                ? "sr-only"
                : "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
            }
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <span
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400"
              aria-hidden="true"
            >
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? errorId : undefined}
            className={`h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm
              text-gray-900 placeholder:text-gray-400 focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-transparent
              dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500
              ${leadingIcon ? "pl-9" : ""}
              ${error ? "border-red-500 focus-visible:ring-red-500" : ""}
              ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
