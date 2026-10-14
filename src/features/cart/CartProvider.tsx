"use client";

import { useMachine } from "@xstate/react";
import { createContext, useCallback, useContext, useMemo } from "react";
import { useToast } from "@/components/toast/ToastProvider";
import { runOptimisticAction } from "@/lib/optimisticAction";
import { syncCart } from "./cartApi";
import { cartMachine } from "./cartMachine";
import type { CartItem } from "./cartTypes";

interface CartContextValue {
  items: CartItem[];
  lastError: string | null;
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, send, actorRef] = useMachine(cartMachine);
  const toast = useToast();

  // Reads live context at call time (not from the render closure) so a
  // rollback restores the snapshot from immediately before this specific
  // mutation, even if other mutations have run since the component rendered.
  const snapshotItems = useCallback(
    () => actorRef.getSnapshot().context.items,
    [actorRef]
  );

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number) => {
      const before = snapshotItems();
      const previousQuantity = before.find((i) => i.id === item.id)?.quantity ?? 0;

      runOptimisticAction({
        apply: () => send({ type: "ADD_ITEM", item, quantity }),
        rollback: () =>
          send({ type: "RESTORE_ITEMS", items: before, error: "" }),
        sync: () =>
          syncCart({
            productId: item.productId,
            variantId: item.variantId,
            quantity: previousQuantity + quantity,
          }),
        onError: (message) => toast.error(message),
      });
      toast.success(`Added ${quantity} × "${item.title}" to your cart.`);
    },
    [send, snapshotItems, toast]
  );

  const removeItem = useCallback(
    (id: string) => {
      const before = snapshotItems();
      const removed = before.find((i) => i.id === id);

      runOptimisticAction({
        apply: () => send({ type: "REMOVE_ITEM", id }),
        rollback: () =>
          send({ type: "RESTORE_ITEMS", items: before, error: "" }),
        sync: () =>
          removed
            ? syncCart({
                productId: removed.productId,
                variantId: removed.variantId,
                quantity: 0,
              })
            : Promise.resolve(),
        onError: (message) => toast.error(message),
      });
    },
    [send, snapshotItems, toast]
  );

  const setQuantity = useCallback(
    (id: string, quantity: number) => {
      const before = snapshotItems();
      const target = before.find((i) => i.id === id);

      runOptimisticAction({
        apply: () => send({ type: "SET_QUANTITY", id, quantity }),
        rollback: () =>
          send({ type: "RESTORE_ITEMS", items: before, error: "" }),
        sync: () =>
          target
            ? syncCart({
                productId: target.productId,
                variantId: target.variantId,
                quantity,
              })
            : Promise.resolve(),
        onError: (message) => toast.error(message),
      });
    },
    [send, snapshotItems, toast]
  );

  const clearCart = useCallback(() => send({ type: "CLEAR_CART" }), [send]);

  const value = useMemo<CartContextValue>(() => {
    const { items, lastError } = state.context;
    return {
      items,
      lastError,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.quantity * i.price, 0),
      addItem,
      removeItem,
      setQuantity,
      clearCart,
    };
  }, [state, addItem, removeItem, setQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
