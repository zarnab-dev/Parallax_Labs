export interface OptimisticActionOptions {
  /** Applied immediately, before the sync call resolves. */
  apply: () => void;
  /** Applied only if `sync` rejects — must undo exactly what `apply` did. */
  rollback: () => void;
  /** The "server" call that confirms the optimistic change. */
  sync: () => Promise<void>;
  /** Called with a human-readable message if `sync` rejects. */
  onError?: (message: string) => void;
}

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Your change was reverted.";

/**
 * Runs an optimistic UI update: applies the change immediately, then
 * confirms it against the server. If confirmation fails, the change is
 * rolled back and `onError` is notified — the UI never ends up out of sync
 * with the server's view of the world.
 */
export async function runOptimisticAction(
  options: OptimisticActionOptions
): Promise<void> {
  options.apply();
  try {
    await options.sync();
  } catch (err) {
    options.rollback();
    const message = err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
    options.onError?.(message);
  }
}
