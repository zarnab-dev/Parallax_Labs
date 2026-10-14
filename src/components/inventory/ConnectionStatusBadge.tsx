"use client";

import { useInventory } from "@/features/inventory/InventoryProvider";

const LABELS: Record<string, string> = {
  open: "Live",
  connecting: "Connecting…",
  reconnecting: "Reconnecting…",
  closed: "Offline",
};

const DOT_CLASSES: Record<string, string> = {
  open: "bg-green-500",
  connecting: "bg-amber-400 animate-pulse",
  reconnecting: "bg-amber-400 animate-pulse",
  closed: "bg-gray-400 dark:bg-gray-600",
};

export function ConnectionStatusBadge() {
  const { status } = useInventory();

  return (
    <span
      className="hidden items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600 sm:inline-flex dark:border-gray-800 dark:text-gray-300"
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${DOT_CLASSES[status]}`}
      />
      {LABELS[status]}
      <span className="sr-only"> — live inventory connection status</span>
    </span>
  );
}
