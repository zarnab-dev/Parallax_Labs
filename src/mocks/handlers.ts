import { http, HttpResponse, delay } from "msw";
import products from "@/data/products.json";
import {
  filterProducts,
  listCategories,
  validateCartSync,
  type CartSyncRequest,
} from "@/lib/catalogApi";
import type { Product, ProductCategory } from "@/types/product";

const typedProducts = products as Product[];

// Simulated network latency so loading/skeleton states are actually exercised
// during development, rather than resolving instantly.
const NETWORK_DELAY_MS = 400;

/**
 * MSW handlers — used in development and Storybook. In production the same
 * endpoints are served by Next.js route handlers (src/app/api/**) so they
 * don't need a second service worker competing with the PWA one. Both are
 * thin wrappers around src/lib/catalogApi.ts.
 */
export const handlers = [
  // GET /api/products?query=&category=
  http.get("/api/products", async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const url = new URL(request.url);
    const results = filterProducts(typedProducts, {
      query: url.searchParams.get("query") ?? "",
      category: (url.searchParams.get("category") as ProductCategory | "All" | null) ?? undefined,
    });
    return HttpResponse.json({ products: results, total: results.length });
  }),

  // GET /api/products/:slug
  http.get("/api/products/:slug", async ({ params }) => {
    await delay(NETWORK_DELAY_MS);
    const product = typedProducts.find((p) => p.slug === params.slug);
    if (!product) {
      return HttpResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  // GET /api/categories
  http.get("/api/categories", async () => {
    await delay(150);
    return HttpResponse.json({ categories: listCategories(typedProducts) });
  }),

  // POST /api/cart/sync — confirms an optimistic cart mutation.
  http.post("/api/cart/sync", async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as CartSyncRequest;
    const result = validateCartSync(typedProducts, body);
    return HttpResponse.json(result.body, { status: result.status });
  }),
];
