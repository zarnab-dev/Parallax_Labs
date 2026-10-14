import { Button } from "@/components/ui/Button";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 py-16 text-center dark:border-red-900/50 dark:bg-red-950/30"
    >
      <p className="font-medium text-red-800 dark:text-red-300">
        Something went wrong
      </p>
      <p className="max-w-sm text-sm text-red-700 dark:text-red-400">
        {message}
      </p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
