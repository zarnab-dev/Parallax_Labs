import { NextResponse } from "next/server";
import products from "@/data/products.json";
import {
  failureRateFromEnv,
  validateCartSync,
  type CartSyncRequest,
} from "@/lib/catalogApi";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: CartSyncRequest;
  try {
    body = (await request.json()) as CartSyncRequest;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }
  const result = validateCartSync(products as Product[], body, {
    failureRate: failureRateFromEnv(process.env.MOCK_API_FAILURE_RATE),
  });
  return NextResponse.json(result.body, { status: result.status });
}
