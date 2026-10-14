import Link from "next/link";

export function ConfirmationStep({ orderId }: { orderId: string | null }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-900/50 dark:bg-green-950/30"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-10 w-10 text-green-600 dark:text-green-400"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12.5l2.5 2.5L16 9" />
      </svg>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Order confirmed
      </h2>
      {orderId && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Order reference: <span className="font-mono">{orderId}</span>
        </p>
      )}
      <p className="max-w-sm text-sm text-gray-600 dark:text-gray-300">
        Thanks for your order — a confirmation has been mocked, no real
        purchase was made.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
      >
        Continue shopping
      </Link>
    </div>
  );
}
