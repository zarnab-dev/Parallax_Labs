import type { Metadata } from "next";
import Link from "next/link";
import { RetryButton } from "./RetryButton";

export const metadata: Metadata = {
  title: "Offline — NorthlineGoods",
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        You&apos;re offline
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        This page isn&apos;t saved on your device yet. Pages and products
        you&apos;ve already visited are still available — reconnect to see
        everything else.
      </p>
      <div className="mt-2 flex gap-3">
        <RetryButton />
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
        >
          Back to catalog
        </Link>
      </div>
    </div>
  );
}
