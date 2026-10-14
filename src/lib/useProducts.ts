"use client";

import { useEffect, useRef, useState } from "react";
import { filterProducts } from "@/lib/catalogApi";
import type { CatalogFilters, Product } from "@/types/product";

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Catalog data hook.
 *
 * - Starts from `initialProducts` (server-rendered), so the first paint has
 *   real content and the default view needs no request at all.
 * - Re-queries the API when filters change; requests are debounced and stale
 *   responses are discarded so a fast typist never sees out-of-order results.
 * - If the request fails because the network is down, falls back to
 *   filtering the already-loaded dataset locally, so search/filter keep
 *   working offline instead of showing an error.
 */
export function useProducts(
  filters: CatalogFilters,
  initialProducts?: Product[]
): UseProductsResult {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [isLoading, setIsLoading] = useState(!initialProducts);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    const isDefaultView = !filters.query && filters.category === "All";

    if (isDefaultView && initialProducts) {
      setProducts(initialProducts);
      setError(null);
      setIsLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.query) params.set("query", filters.query);
        if (filters.category) params.set("category", filters.category);

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();

        if (currentRequestId === requestId.current) {
          setProducts(data.products);
        }
      } catch (err) {
        if (currentRequestId !== requestId.current) return;
        const networkDown = err instanceof TypeError;
        if (networkDown && initialProducts) {
          setProducts(filterProducts(initialProducts, filters));
        } else {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (currentRequestId === requestId.current) {
          setIsLoading(false);
        }
      }
    }, 250); // debounce search typing

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.query, filters.category, retryToken]);

  const refetch = () => setRetryToken((t) => t + 1);

  return { products, isLoading, error, refetch };
}
