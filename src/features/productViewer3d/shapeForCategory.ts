import type { ProductCategory } from "@/types/product";

export type ShapeKind = "shoe" | "folded-apparel" | "ring" | "device" | "vessel" | "tent";

/**
 * This catalog has no real product 3D scans (.glb/.gltf authored by a 3D
 * team) to load, and there's no legitimate source to fetch placeholder ones
 * from. Instead, each category maps to a simple, representative procedural
 * shape built from Three.js primitives — same approach as the generated
 * SVG placeholders used for the 2D gallery, just in 3D.
 */
export function shapeForCategory(category: ProductCategory): ShapeKind {
  switch (category) {
    case "Footwear":
      return "shoe";
    case "Apparel":
      return "folded-apparel";
    case "Accessories":
      return "ring";
    case "Electronics":
      return "device";
    case "Home":
      return "vessel";
    case "Outdoor":
      return "tent";
    default:
      return "device";
  }
}
