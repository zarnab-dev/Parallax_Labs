import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label: string;
  hideLabel?: boolean;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hideLabel = false, options, id, className = "", ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div>
        <label
          htmlFor={selectId}
          className={
            hideLabel
              ? "sr-only"
              : "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
          }
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm
            text-gray-900 focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-brand-500 focus-visible:border-transparent
            dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
