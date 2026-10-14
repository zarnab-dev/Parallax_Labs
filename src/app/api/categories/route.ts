import { NextResponse } from "next/server";
import products from "@/data/products.json";
import { listCategories } from "@/lib/catalogApi";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ categories: listCategories(products as Product[]) });
}
