"use client";

import { useState } from "react";
import { ImageGallery } from "@/components/catalog/ImageGallery";
import { ProductViewer3D } from "@/features/productViewer3d/ProductViewer3D";
import type { Product } from "@/types/product";

type MediaTab = "photos" | "3d";

export function ProductMediaPanel({ product }: { product: Product }) {
  const [tab, setTab] = useState<MediaTab>("photos");

  return (
    <div>
      <div role="tablist" aria-label="Product media view" className="mb-3 inline-flex rounded-lg border border-gray-300 p-0.5 dark:border-gray-700">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "photos"}
          onClick={() => setTab("photos")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
            ${tab === "photos" ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
        >
          Photos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "3d"}
          onClick={() => setTab("3d")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
            ${tab === "3d" ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
        >
          View in 3D
        </button>
      </div>

      {tab === "photos" ? (
        <ImageGallery images={product.images} title={product.title} />
      ) : (
        <ProductViewer3D product={product} />
      )}
    </div>
  );
}
