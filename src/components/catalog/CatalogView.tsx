"use client";

import { useState } from "react";
import { CategoryFilter } from "@/components/catalog/CategoryFilter";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SearchBar } from "@/components/catalog/SearchBar";
import { ViewToggle } from "@/components/catalog/ViewToggle";
import { useProducts } from "@/lib/useProducts";
import type { Product, ProductCategory, ViewMode } from "@/types/product";

interface CatalogViewProps {
  initialProducts?: Product[];
  initialCategories?: ProductCategory[];
}

export function CatalogView({ initialProducts, initialCategories }: CatalogViewProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "All">("All");
  const [view, setView] = useState<ViewMode>("grid");

  const { products, isLoading, error, refetch } = useProducts(
    { query, category },
    initialProducts
  );

  return (
    <section aria-labelledby="catalog-heading">
      <div className="mb-6">
        <h1
          id="catalog-heading"
          className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
        >
          Shop all products
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isLoading ? "Loading…" : `${products.length} products`}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:w-72">
            <SearchBar value={query} onChange={setQuery} />
          </div>
          <div className="w-full sm:w-56">
            <CategoryFilter
              value={category}
              onChange={setCategory}
              initialCategories={initialCategories}
            />
          </div>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </div>

      <ProductGrid
        products={products}
        isLoading={isLoading}
        error={error}
        view={view}
        query={query}
        onRetry={refetch}
      />
    </section>
  );
}
