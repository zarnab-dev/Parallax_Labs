"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { ProductImage } from "@/components/ui/ProductImage";
import { useInventory } from "@/features/inventory/InventoryProvider";
import { formatPrice } from "@/lib/formatPrice";
import type { Product, ViewMode } from "@/types/product";

interface ProductCardProps {
  product: Product;
  view: ViewMode;
  /** Mark above-the-fold cards so their image is preloaded (LCP). */
  priority?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-1 text-amber-500"
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L10 1.5z" />
      </svg>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export function ProductCard({ product, view, priority = false }: ProductCardProps) {
  const { getLiveStock } = useInventory();
  const liveTotal = product.variants.reduce(
    (sum, v) => sum + (getLiveStock(v.id) ?? v.stock),
    0
  );
  const outOfStock = liveTotal === 0;

  if (view === "list") {
    return (
      <Card className="flex gap-4 p-4 transition-shadow hover:shadow-md">
        <Link
          href={`/products/${product.slug}`}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          <ProductImage
            src={product.images[0] ?? ""}
            alt={product.title}
            fill
            sizes="96px"
            priority={priority}
            className="object-cover"
          />
        </Link>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/products/${product.slug}`}
                className="font-medium text-gray-900 hover:underline dark:text-gray-100"
              >
                {product.title}
              </Link>
              {outOfStock ? (
                <Badge tone="danger">Out of stock</Badge>
              ) : product.isNew ? (
                <Badge tone="brand">New</Badge>
              ) : null}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
              {product.description}
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <StarRating rating={product.rating} />
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatPrice(product.price, product.currency)}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800"
      >
        <ProductImage
          src={product.images[0] ?? ""}
          alt={product.title}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw"
          priority={priority}
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && <Badge tone="brand">New</Badge>}
          {outOfStock && <Badge tone="danger">Out of stock</Badge>}
        </div>
      </Link>
      <CardBody className="flex flex-1 flex-col gap-1">
        <Link
          href={`/products/${product.slug}`}
          className="font-medium text-gray-900 hover:underline dark:text-gray-100"
        >
          {product.title}
        </Link>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {product.category}
        </span>
        <div className="mt-auto flex items-center justify-between pt-2">
          <StarRating rating={product.rating} />
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
