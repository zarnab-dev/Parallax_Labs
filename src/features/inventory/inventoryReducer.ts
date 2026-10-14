export interface InventoryMessage {
  type: "STOCK_DELTA";
  variantId: string;
  /** Negative for a purchase, positive for a restock. */
  delta: number;
  /** Echoed back so a tab can ignore its own broadcast if it already applied it locally. */
  sourceId: string;
}

export type StockMap = Record<string, number>;

/**
 * Applies an incoming inventory message to the live stock map. Stock is
 * clamped at 0 — a late-arriving or duplicate delta can never push a
 * variant negative.
 */
export function applyInventoryMessage(
  stock: StockMap,
  message: InventoryMessage
): StockMap {
  const current = stock[message.variantId] ?? 0;
  const next = Math.max(0, current + message.delta);
  return { ...stock, [message.variantId]: next };
}
