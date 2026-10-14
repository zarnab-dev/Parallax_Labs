import type { HTMLAttributes } from "react";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "brand";

const toneClasses: Record<BadgeTone, string> = {
  neutral:
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
  success:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  warning:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  brand: "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
        ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
