import Image from "next/image";
import type { ComponentProps } from "react";

type ProductImageProps = ComponentProps<typeof Image>;

/**
 * Single place for product imagery. Wraps next/image (responsive `sizes`,
 * lazy loading by default, `priority` for the LCP image, and a reserved
 * aspect-ratio box from the parent so nothing shifts).
 *
 * SVGs are already resolution-independent and tiny, so routing them through
 * the /_next/image optimizer would only add a request; they're served
 * directly. Raster images (jpg/png/webp) added later get the full
 * optimizer pipeline (AVIF/WebP + srcset) automatically.
 */
export function ProductImage({ src, alt, unoptimized, ...props }: ProductImageProps) {
  const isSvg = typeof src === "string" && src.split("?")[0]?.endsWith(".svg");
  return <Image src={src} alt={alt} unoptimized={unoptimized ?? isSvg} {...props} />;
}
