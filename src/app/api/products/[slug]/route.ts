import { NextResponse } from "next/server";
import products from "@/data/products.json";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export function GET(_request: Request, { params }: { params: { slug: string } }) {
  const product = (products as Product[]).find((p) => p.slug === params.slug);
  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}
