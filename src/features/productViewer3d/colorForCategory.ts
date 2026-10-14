import type { ProductCategory } from "@/types/product";

// Mirrors the palette used by scripts/generate-seed-data.mjs for the 2D
// placeholder images, so the 3D viewer's accent color matches a product's
// category consistently with its gallery images.
const COLOR_BY_CATEGORY: Record<ProductCategory, string> = {
  Footwear: "#2563eb",
  Apparel: "#7c3aed",
  Accessories: "#db2777",
  Electronics: "#059669",
  Home: "#d97706",
  Outdoor: "#0891b2",
};

export function colorForCategory(category: ProductCategory): string {
  return COLOR_BY_CATEGORY[category] ?? "#2563eb";
}
