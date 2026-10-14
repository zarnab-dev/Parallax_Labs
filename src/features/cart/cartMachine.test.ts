import { createActor } from "xstate";
import { describe, expect, it } from "vitest";
import { cartMachine } from "./cartMachine";
import type { CartItem } from "./cartTypes";

const baseItem: Omit<CartItem, "quantity"> = {
  id: "p001::p001-v1",
  productId: "p001",
  productSlug: "p001-pro-running-shoe",
  variantId: "p001-v1",
  title: "Pro Running Shoe",
  variantLabel: "Size 9",
  price: 89.99,
  image: "/images/products/p001-pro-running-shoe.svg",
  maxStock: 5,
};

function start() {
  const actor = createActor(cartMachine);
  actor.start();
  return actor;
}

describe("cartMachine", () => {
  it("starts with an empty cart", () => {
    const actor = start();
    expect(actor.getSnapshot().context.items).toEqual([]);
    expect(actor.getSnapshot().context.lastError).toBeNull();
  });

  it("adds a new item", () => {
    const actor = start();
    actor.send({ type: "ADD_ITEM", item: baseItem, quantity: 2 });

    const { items, lastError } = actor.getSnapshot().context;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: baseItem.id, quantity: 2 });
    expect(lastError).toBeNull();
  });

  it("increments quantity when the same item is added again", () => {
    const actor = start();
    actor.send({ type: "ADD_ITEM", item: baseItem, quantity: 2 });
    actor.send({ type: "ADD_ITEM", item: baseItem, quantity: 1 });

    const { items } = actor.getSnapshot().context;
    expect(items).toHaveLength(1);
    expect(items[0]?.quantity).toBe(3);
  });

  it("clamps quantity to available stock and reports an error", () => {
    const actor = start();
    actor.send({ type: "ADD_ITEM", item: baseItem, quantity: 10 });

    const { items, lastError } = actor.getSnapshot().context;
    expect(items[0]?.quantity).toBe(baseItem.maxStock);
    expect(lastError).toMatch(/Only 5/);
  });

  it("rejects adding an out-of-stock item", () => {
    const actor = start();
    actor.send({
      type: "ADD_ITEM",
      item: { ...baseItem, maxStock: 0 },
      quantity: 1,
    });

    const { items, lastError } = actor.getSnapshot().context;
    expect(items).toHaveLength(0);
    expect(lastError).toMatch(/out of stock/);
  });

  it("updates quantity within valid bounds", () => {
    const actor = start();
    actor.send({ type: "ADD_ITEM", item: baseItem, quantity: 1 });
    actor.send({ type: "SET_QUANTITY", id: baseItem.id, quantity: 4 });

    const { items, lastError } = actor.getSnapshot().context;
    expect(items[0]?.quantity).toBe(4);
    expect(lastError).toBeNull();
  });

  it("guards against setting quantity above stock", () => {
    const actor = start();
    actor.send({ type: "ADD_ITEM", item: baseItem, quantity: 1 });
    actor.send({ type: "SET_QUANTITY", id: baseItem.id, quantity: 99 });

    const { items, lastError } = actor.getSnapshot().context;
    expect(items[0]?.quantity).toBe(baseItem.maxStock);
    expect(lastError).toMatch(/Only 5/);
  });

  it("guards against setting quantity below 1", () => {
    const actor = start();
    actor.send({ type: "ADD_ITEM", item: baseItem, quantity: 1 });
    actor.send({ type: "SET_QUANTITY", id: baseItem.id, quantity: 0 });

    const { items, lastError } = actor.getSnapshot().context;
    expect(items[0]?.quantity).toBe(1);
    expect(lastError).toMatch(/at least 1/);
  });

  it("removes an item", () => {
    const actor = start();
    actor.send({ type: "ADD_ITEM", item: baseItem, quantity: 1 });
    actor.send({ type: "REMOVE_ITEM", id: baseItem.id });

    expect(actor.getSnapshot().context.items).toHaveLength(0);
  });

  it("clears the cart", () => {
    const actor = start();
    actor.send({ type: "ADD_ITEM", item: baseItem, quantity: 1 });
    actor.send({
      type: "ADD_ITEM",
      item: { ...baseItem, id: "p002::v1", maxStock: 3 },
      quantity: 1,
    });
    actor.send({ type: "CLEAR_CART" });

    expect(actor.getSnapshot().context.items).toHaveLength(0);
  });
});
