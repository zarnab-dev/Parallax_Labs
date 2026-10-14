import { CatalogView } from "@/components/catalog/CatalogView";
import products from "@/data/products.json";
import { listCategories } from "@/lib/catalogApi";
import type { Product } from "@/types/product";

const typedProducts = products as Product[];

export default function HomePage() {
  // Rendered on the server so the HTML already contains the full grid
  // (fast first paint/LCP, works with JS slow or unavailable). Filtering
  // then goes through the API, with a local fallback while offline.
  return (
    <CatalogView
      initialProducts={typedProducts}
      initialCategories={listCategories(typedProducts)}
    />
  );
}
