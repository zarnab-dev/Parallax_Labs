import { describe, expect, it } from "vitest";
import products from "@/data/products.json";
import type { Product } from "@/types/product";
import {
  failureRateFromEnv,
  filterProducts,
  listCategories,
  SIMULATED_FAILURE_RATE,
  validateCartSync,
} from "./catalogApi";

const all = products as Product[];

describe("filterProducts", () => {
  it("returns everything with no filters", () => {
    expect(filterProducts(all, {})).toHaveLength(all.length);
  });

  it("treats the 'All' category as no category filter", () => {
    expect(filterProducts(all, { category: "All" })).toHaveLength(all.length);
  });

  it("filters by category", () => {
    const result = filterProducts(all, { category: "Footwear" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.category === "Footwear")).toBe(true);
  });

  it("searches title case-insensitively", () => {
    const result = filterProducts(all, { query: "RUNNING SHOE" });
    expect(result.some((p) => p.title.includes("Running Shoe"))).toBe(true);
  });

  it("combines query and category", () => {
    const result = filterProducts(all, { query: "shoe", category: "Footwear" });
    expect(result.every((p) => p.category === "Footwear")).toBe(true);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterProducts(all, { query: "zzzz-no-match" })).toEqual([]);
  });
});

describe("listCategories", () => {
  it("returns the six unique categories, sorted", () => {
    const cats = listCategories(all);
    expect(cats).toEqual([...cats].sort());
    expect(new Set(cats).size).toBe(cats.length);
    expect(cats).toHaveLength(6);
  });
});

describe("validateCartSync", () => {
  const product = all.find((p) => p.variants.some((v) => v.stock > 1))!;
  const variant = product.variants.find((v) => v.stock > 1)!;
  const ok = { random: () => 0.99 }; // never triggers the simulated failure

  it("accepts a quantity within stock", () => {
    const result = validateCartSync(
      all,
      { productId: product.id, variantId: variant.id, quantity: 1 },
      ok
    );
    expect(result.status).toBe(200);
  });

  it("accepts quantity 0 (removal)", () => {
    const result = validateCartSync(
      all,
      { productId: product.id, variantId: variant.id, quantity: 0 },
      ok
    );
    expect(result.status).toBe(200);
  });

  it("rejects a quantity above stock with a 409", () => {
    const result = validateCartSync(
      all,
      { productId: product.id, variantId: variant.id, quantity: variant.stock + 1 },
      ok
    );
    expect(result.status).toBe(409);
  });

  it("rejects an unknown product with a 404", () => {
    const result = validateCartSync(
      all,
      { productId: "nope", variantId: "nope", quantity: 1 },
      ok
    );
    expect(result.status).toBe(404);
  });

  it("injects the simulated transient failure below the failure rate", () => {
    const result = validateCartSync(
      all,
      { productId: product.id, variantId: variant.id, quantity: 1 },
      { random: () => SIMULATED_FAILURE_RATE - 0.01 }
    );
    expect(result.status).toBe(500);
  });

  it("never injects the failure when failureRate is 0", () => {
    const result = validateCartSync(
      all,
      { productId: product.id, variantId: variant.id, quantity: 1 },
      { random: () => 0, failureRate: 0 }
    );
    expect(result.status).toBe(200);
  });
});

describe("failureRateFromEnv", () => {
  it("falls back to the default when unset or invalid", () => {
    expect(failureRateFromEnv(undefined)).toBe(SIMULATED_FAILURE_RATE);
    expect(failureRateFromEnv("")).toBe(SIMULATED_FAILURE_RATE);
    expect(failureRateFromEnv("abc")).toBe(SIMULATED_FAILURE_RATE);
    expect(failureRateFromEnv("2")).toBe(SIMULATED_FAILURE_RATE);
  });

  it("accepts a valid rate including 0", () => {
    expect(failureRateFromEnv("0")).toBe(0);
    expect(failureRateFromEnv("0.5")).toBe(0.5);
  });
});
