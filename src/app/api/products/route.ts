import { NextResponse } from "next/server";
import products from "@/data/products.json";
import { filterProducts } from "@/lib/catalogApi";
import type { Product, ProductCategory } from "@/types/product";

export const dynamic = "force-dynamic";

// Production implementation of the mock catalog API (MSW serves the same
// contract in development — see src/mocks/handlers.ts).
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const results = filterProducts(products as Product[], {
    query: params.get("query") ?? "",
    category: (params.get("category") as ProductCategory | "All" | null) ?? undefined,
  });
  return NextResponse.json({ products: results, total: results.length });
}
