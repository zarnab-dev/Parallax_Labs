"use client";

import type { ViewMode } from "@/types/product";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Catalog view"
      className="inline-flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700"
    >
      <button
        type="button"
        aria-pressed={value === "grid"}
        onClick={() => onChange("grid")}
        className={`flex h-10 w-10 items-center justify-center transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
          ${
            value === "grid"
              ? "bg-brand-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
      >
        <span className="sr-only">Grid view</span>
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <rect x="2" y="2" width="7" height="7" rx="1" />
          <rect x="11" y="2" width="7" height="7" rx="1" />
          <rect x="2" y="11" width="7" height="7" rx="1" />
          <rect x="11" y="11" width="7" height="7" rx="1" />
        </svg>
      </button>
      <button
        type="button"
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
        className={`flex h-10 w-10 items-center justify-center border-l border-gray-300 transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
          dark:border-gray-700
          ${
            value === "list"
              ? "bg-brand-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
      >
        <span className="sr-only">List view</span>
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <rect x="2" y="3" width="16" height="3" rx="1" />
          <rect x="2" y="8.5" width="16" height="3" rx="1" />
          <rect x="2" y="14" width="16" height="3" rx="1" />
        </svg>
      </button>
    </div>
  );
}
