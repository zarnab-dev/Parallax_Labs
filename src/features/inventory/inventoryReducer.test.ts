import { describe, expect, it } from "vitest";
import { applyInventoryMessage } from "./inventoryReducer";

describe("applyInventoryMessage", () => {
  it("decrements stock for a purchase", () => {
    const result = applyInventoryMessage(
      { "v1": 5 },
      { type: "STOCK_DELTA", variantId: "v1", delta: -2, sourceId: "tab-a" }
    );
    expect(result["v1"]).toBe(3);
  });

  it("increments stock for a restock", () => {
    const result = applyInventoryMessage(
      { "v1": 5 },
      { type: "STOCK_DELTA", variantId: "v1", delta: 3, sourceId: "tab-a" }
    );
    expect(result["v1"]).toBe(8);
  });

  it("initializes an unknown variant at 0 before applying the delta", () => {
    const result = applyInventoryMessage(
      {},
      { type: "STOCK_DELTA", variantId: "v9", delta: -1, sourceId: "tab-a" }
    );
    expect(result["v9"]).toBe(0);
  });

  it("clamps stock at 0, never going negative", () => {
    const result = applyInventoryMessage(
      { "v1": 1 },
      { type: "STOCK_DELTA", variantId: "v1", delta: -5, sourceId: "tab-a" }
    );
    expect(result["v1"]).toBe(0);
  });

  it("does not mutate the input map", () => {
    const input = { "v1": 5 };
    applyInventoryMessage(input, {
      type: "STOCK_DELTA",
      variantId: "v1",
      delta: -1,
      sourceId: "tab-a",
    });
    expect(input["v1"]).toBe(5);
  });

  it("leaves other variants untouched", () => {
    const result = applyInventoryMessage(
      { "v1": 5, "v2": 10 },
      { type: "STOCK_DELTA", variantId: "v1", delta: -1, sourceId: "tab-a" }
    );
    expect(result["v2"]).toBe(10);
  });
});
