import { assign, setup } from "xstate";
import type { CartContext, CartEvent } from "./cartTypes";

function clampQuantity(quantity: number, maxStock: number) {
  return Math.min(Math.max(Math.round(quantity), 0), Math.max(maxStock, 0));
}

const initialContext: CartContext = {
  items: [],
  lastError: null,
};

/**
 * Manages shopping cart state as its own machine (rather than a plain
 * reducer) so it can later be composed as a child actor of the Week 3+
 * checkout machine (Cart -> Shipping -> Payment -> Confirmation) without
 * having to be rewritten.
 *
 * All quantity changes are guarded here: values are clamped to
 * [1, variant.maxStock], and out-of-range attempts surface a `lastError`
 * message the UI can present as a toast/inline validation error, instead of
 * ever landing in an invalid state.
 */
export const cartMachine = setup({
  types: {
    context: {} as CartContext,
    events: {} as CartEvent,
  },
  actions: {
    addItem: assign(({ context, event }) => {
      if (event.type !== "ADD_ITEM") return {};
      const { item, quantity } = event;

      const existing = context.items.find((i) => i.id === item.id);
      if (existing) {
        const requested = existing.quantity + quantity;
        const clamped = clampQuantity(requested, existing.maxStock);
        const wasClamped = clamped !== requested;
        return {
          items: context.items.map((i) =>
            i.id === item.id ? { ...i, quantity: clamped } : i
          ),
          lastError: wasClamped
            ? `Only ${existing.maxStock} of "${existing.title}" available — quantity adjusted.`
            : null,
        };
      }

      const clamped = clampQuantity(quantity, item.maxStock);
      if (clamped <= 0) {
        return {
          lastError: `"${item.title}" (${item.variantLabel}) is out of stock.`,
        };
      }
      return {
        items: [...context.items, { ...item, quantity: clamped }],
        lastError:
          clamped !== quantity
            ? `Only ${item.maxStock} of "${item.title}" available — quantity adjusted.`
            : null,
      };
    }),

    removeItem: assign(({ context, event }) => {
      if (event.type !== "REMOVE_ITEM") return {};
      return {
        items: context.items.filter((i) => i.id !== event.id),
        lastError: null,
      };
    }),

    setQuantity: assign(({ context, event }) => {
      if (event.type !== "SET_QUANTITY") return {};
      const target = context.items.find((i) => i.id === event.id);
      if (!target) return {};

      const clamped = clampQuantity(event.quantity, target.maxStock);
      let lastError: string | null = null;
      if (event.quantity < 1) {
        lastError = "Quantity must be at least 1. Remove the item instead?";
      } else if (event.quantity > target.maxStock) {
        lastError = `Only ${target.maxStock} of "${target.title}" available.`;
      }

      return {
        items: context.items.map((i) =>
          i.id === event.id ? { ...i, quantity: clamped || 1 } : i
        ),
        lastError,
      };
    }),

    clearCart: assign(() => ({ items: [], lastError: null })),

    restoreItems: assign(({ event }) => {
      if (event.type !== "RESTORE_ITEMS") return {};
      return { items: event.items, lastError: event.error };
    }),
  },
}).createMachine({
  id: "cart",
  context: initialContext,
  initial: "idle",
  states: {
    idle: {
      on: {
        ADD_ITEM: { actions: "addItem" },
        REMOVE_ITEM: { actions: "removeItem" },
        SET_QUANTITY: { actions: "setQuantity" },
        CLEAR_CART: { actions: "clearCart" },
        RESTORE_ITEMS: { actions: "restoreItems" },
      },
    },
  },
});
