const STEPS = ["Cart", "Shipping", "Payment", "Confirmation"] as const;

export function CheckoutSteps({ currentIndex }: { currentIndex: number }) {
  return (
    <ol
      aria-label="Checkout progress"
      className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-3 text-sm"
    >
      {STEPS.map((step, index) => {
        const state =
          index < currentIndex
            ? "done"
            : index === currentIndex
            ? "current"
            : "upcoming";
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              aria-current={state === "current" ? "step" : undefined}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
                ${
                  state === "done"
                    ? "bg-brand-600 text-white"
                    : state === "current"
                    ? "border-2 border-brand-600 text-brand-600 dark:text-brand-400"
                    : "border border-gray-400 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                }`}
            >
              {state === "done" ? "✓" : index + 1}
            </span>
            <span
              className={
                state === "upcoming"
                  ? "text-gray-600 dark:text-gray-400"
                  : "font-medium text-gray-900 dark:text-gray-100"
              }
            >
              {step}
            </span>
            {index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="mx-1 h-px w-6 bg-gray-300 dark:bg-gray-700"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
