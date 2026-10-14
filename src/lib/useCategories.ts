"use client";

import { useEffect, useState } from "react";
import type { ProductCategory } from "@/types/product";

/** Uses server-provided categories when given; otherwise fetches them. */
export function useCategories(initial?: ProductCategory[]): ProductCategory[] {
  const [categories, setCategories] = useState<ProductCategory[]>(initial ?? []);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setCategories(data.categories);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  return categories;
}
