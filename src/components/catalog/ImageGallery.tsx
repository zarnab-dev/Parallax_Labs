"use client";

import { ProductImage } from "@/components/ui/ProductImage";
import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
        <ProductImage
          key={activeIndex}
          src={images[activeIndex] ?? ""}
          alt={`${title} — view ${activeIndex + 1} of ${images.length}`}
          fill
          sizes="(min-width: 768px) 45vw, 90vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div
          role="tablist"
          aria-label={`${title} image thumbnails`}
          className="mt-3 flex gap-2"
        >
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-current={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
                ${
                  index === activeIndex
                    ? "border-brand-600"
                    : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                }`}
            >
              <span className="sr-only">{`View ${index + 1}`}</span>
              <ProductImage
                src={image}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
