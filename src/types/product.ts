export type ProductCategory =
  | "Footwear"
  | "Apparel"
  | "Accessories"
  | "Electronics"
  | "Home"
  | "Outdoor";

export interface ProductVariant {
  id: string;
  label: string; // e.g. "Size 9", "Black / M"
  stock: number;
  priceModifier?: number; // optional delta from base price
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number; // base price in USD
  currency: "USD";
  category: ProductCategory;
  tags: string[];
  images: string[]; // paths under /images/products
  rating: number; // 0-5
  reviewCount: number;
  stock: number; // aggregate stock (sum of variants, used for catalog badges)
  variants: ProductVariant[];
  isNew?: boolean;
  isFeatured?: boolean;
}

export type ViewMode = "grid" | "list";

export interface CatalogFilters {
  query: string;
  category: ProductCategory | "All";
}
