import type { CatalogFilters, Product, ProductCategory } from "@/types/product";

/**
 * Single source of truth for the mock backend's behaviour. The MSW handlers
 * (development + Storybook) and the Next.js route handlers (production) are
 * both thin wrappers around these pure functions, so the two can't drift.
 */

export function filterProducts(
  products: Product[],
  filters: Partial<CatalogFilters>
): Product[] {
  const query = filters.query?.toLowerCase().trim() ?? "";
  const category = filters.category;

  return products.filter((p) => {
    if (category && category !== "All" && p.category !== category) return false;
    if (!query) return true;
    return (
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tags.some((t) => t.includes(query))
    );
  });
}

export function listCategories(products: Product[]): ProductCategory[] {
  return Array.from(new Set(products.map((p) => p.category))).sort();
}

export interface CartSyncRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CartSyncResult {
  status: 200 | 404 | 409 | 500;
  body: { ok: true } | { message: string };
}

/** Probability that a valid cart sync is rejected, to exercise optimistic rollback. */
export const SIMULATED_FAILURE_RATE = 0.12;

export interface CartSyncOptions {
  /** Injectable so the simulated transient failure is deterministic in tests. */
  random?: () => number;
  /** Overrides SIMULATED_FAILURE_RATE (0 disables the simulated failure). */
  failureRate?: number;
}

/** Reads MOCK_API_FAILURE_RATE (0–1) if set; used by the route handlers/e2e. */
export function failureRateFromEnv(value: string | undefined): number {
  const parsed = value === undefined || value === "" ? NaN : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1
    ? parsed
    : SIMULATED_FAILURE_RATE;
}

/** Validates a cart mutation against known stock. */
export function validateCartSync(
  products: Product[],
  request: CartSyncRequest,
  { random = Math.random, failureRate = SIMULATED_FAILURE_RATE }: CartSyncOptions = {}
): CartSyncResult {
  const product = products.find((p) => p.id === request.productId);
  const variant = product?.variants.find((v) => v.id === request.variantId);

  if (!product || !variant) {
    return {
      status: 404,
      body: { message: "Product or variant no longer exists." },
    };
  }

  if (request.quantity > variant.stock) {
    return {
      status: 409,
      body: {
        message: `Only ${variant.stock} of "${product.title}" (${variant.label}) left in stock.`,
      },
    };
  }

  if (random() < failureRate) {
    return {
      status: 500,
      body: { message: "Network error while saving your cart. Please try again." },
    };
  }

  return { status: 200, body: { ok: true } };
}
