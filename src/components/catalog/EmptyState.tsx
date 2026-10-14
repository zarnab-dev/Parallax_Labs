export function EmptyState({ query }: { query: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-10 w-10 text-gray-400"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="M21 21l-4-4" />
      </svg>
      <p className="font-medium text-gray-900 dark:text-gray-100">
        No products found
      </p>
      <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {query
          ? `We couldn't find anything matching "${query}". Try a different search term or clear your filters.`
          : "No products match the selected filters."}
      </p>
    </div>
  );
}
