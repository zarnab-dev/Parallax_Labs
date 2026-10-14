interface SyncCartPayload {
  productId: string;
  variantId: string;
  quantity: number;
}

/**
 * Confirms a cart mutation with the mock backend. Throws with a
 * human-readable message on failure so callers can feed it straight to
 * `runOptimisticAction`'s rollback path.
 */
export async function syncCart(payload: SyncCartPayload): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // fetch only rejects when the network itself is unreachable (offline).
    throw new Error(
      "You're offline — that cart change couldn't be saved and was reverted."
    );
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? "Failed to update your cart.");
  }
}
