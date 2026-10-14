import { EmptyState } from "@/components/catalog/EmptyState";
import { ErrorState } from "@/components/catalog/ErrorState";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import type { Product, ViewMode } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  view: ViewMode;
  query: string;
  onRetry: () => void;
}

const SKELETON_COUNT = 8;
// First row of cards is above the fold on desktop; preload their images.
const PRIORITY_COUNT = 4;

export function ProductGrid({
  products,
  isLoading,
  error,
  view,
  query,
  onRetry,
}: ProductGridProps) {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className={
          view === "grid"
            ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            : "flex flex-col gap-3"
        }
      >
        <span className="sr-only">Loading products…</span>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <ProductCardSkeleton key={i} view={view} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <div
      aria-live="polite"
      className={
        view === "grid"
          ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          : "flex flex-col gap-3"
      }
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          view={view}
          priority={index < PRIORITY_COUNT}
        />
      ))}
    </div>
  );
}
