export interface BackoffOptions {
  baseMs?: number;
  maxMs?: number;
  /** Multiplier applied per attempt (2 = classic doubling). */
  factor?: number;
}

/**
 * Computes the delay before reconnect attempt `attempt` (0-indexed: the
 * first retry is attempt 0). Grows exponentially from `baseMs`, capped at
 * `maxMs`, so repeated failures don't hammer the connection or spin the
 * delay up indefinitely.
 */
export function computeBackoffDelay(
  attempt: number,
  options: BackoffOptions = {}
): number {
  const { baseMs = 1000, maxMs = 30000, factor = 2 } = options;
  if (attempt < 0) return baseMs;
  const delay = baseMs * Math.pow(factor, attempt);
  return Math.min(delay, maxMs);
}
