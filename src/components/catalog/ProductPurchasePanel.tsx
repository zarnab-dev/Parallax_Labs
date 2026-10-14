"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/toast/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCart } from "@/features/cart/CartProvider";
import { useInventory } from "@/features/inventory/InventoryProvider";
import { formatPrice } from "@/lib/formatPrice";
import type { Product } from "@/types/product";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const { getLiveStock } = useInventory();
  const stockFor = (variantId: string, fallback: number) =>
    getLiveStock(variantId) ?? fallback;

  const inStockVariants = product.variants.filter(
    (v) => stockFor(v.id, v.stock) > 0
  );
  const [variantId, setVariantId] = useState(
    inStockVariants[0]?.id ?? product.variants[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const toast = useToast();

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === variantId),
    [product.variants, variantId]
  );

  const maxStock = selectedVariant
    ? stockFor(selectedVariant.id, selectedVariant.stock)
    : 0;

  function handleAddToCart() {
    if (!selectedVariant || maxStock <= 0) {
      toast.error(`"${product.title}" is currently out of stock.`);
      return;
    }

    addItem(
      {
        id: `${product.id}::${selectedVariant.id}`,
        productId: product.id,
        productSlug: product.slug,
        variantId: selectedVariant.id,
        title: product.title,
        variantLabel: selectedVariant.label,
        price: product.price,
        image: product.images[0] ?? "",
        maxStock,
      },
      quantity
    );
  }

  return (
    <div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {product.category}
      </span>
      <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {product.title}
      </h1>
      <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {formatPrice(product.price, product.currency)}
      </p>

      <div className="mt-3 flex gap-2">
        {product.isNew && <Badge tone="brand">New</Badge>}
        <Badge tone={maxStock > 0 ? "success" : "danger"}>
          {maxStock > 0 ? "In stock" : "Out of stock"}
        </Badge>
      </div>

      <p className="mt-4 text-gray-600 dark:text-gray-300">
        {product.description}
      </p>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Options
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.variants.map((variant) => {
            const selected = variant.id === variantId;
            const disabled = stockFor(variant.id, variant.stock) === 0;
            return (
              <button
                key={variant.id}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => {
                  setVariantId(variant.id);
                  setQuantity(1);
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
                  ${
                    disabled
                      ? "cursor-not-allowed border-gray-200 text-gray-400 line-through dark:border-gray-800 dark:text-gray-600"
                      : selected
                      ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      : "border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:text-gray-200"
                  }`}
              >
                {variant.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex items-center gap-4">
        <QuantityStepper
          value={quantity}
          max={Math.max(maxStock, 1)}
          onChange={setQuantity}
          label={`Quantity for ${product.title}`}
        />
        <Button
          onClick={handleAddToCart}
          disabled={maxStock <= 0}
          size="lg"
          className="flex-1"
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
}
