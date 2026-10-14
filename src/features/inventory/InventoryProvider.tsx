"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ConnectionStatus } from "./connectionStatus";
import { applyInventoryMessage } from "./inventoryReducer";
import type { StockMap } from "./inventoryReducer";
import { InventorySocket } from "./InventorySocket";

interface InventoryContextValue {
  status: ConnectionStatus;
  /** Live stock for a variant if a real-time update has been seen, else undefined. */
  getLiveStock: (variantId: string) => number | undefined;
  /** Broadcasts a purchase to other tabs and applies it locally. */
  broadcastPurchase: (items: { variantId: string; quantity: number }[]) => void;
}

const InventoryContext = createContext<InventoryContextValue | undefined>(
  undefined
);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [stock, setStock] = useState<StockMap>({});
  const socketRef = useRef<InventorySocket | null>(null);

  useEffect(() => {
    // BroadcastChannel is unavailable during SSR/build; the provider is a
    // client component, so this only ever runs in the browser, but the
    // guard keeps it safe if that ever changes.
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      setStatus("closed");
      return;
    }

    const socket = new InventorySocket({
      onStatusChange: setStatus,
      onMessage: (message) => setStock((prev) => applyInventoryMessage(prev, message)),
    });
    socketRef.current = socket;
    socket.connect();

    return () => socket.close();
  }, []);

  const getLiveStock = useCallback(
    (variantId: string) => stock[variantId],
    [stock]
  );

  const broadcastPurchase = useCallback(
    (items: { variantId: string; quantity: number }[]) => {
      const socket = socketRef.current;
      setStock((prev) => {
        let next = prev;
        for (const item of items) {
          next = applyInventoryMessage(next, {
            type: "STOCK_DELTA",
            variantId: item.variantId,
            delta: -item.quantity,
            sourceId: socket?.sourceId ?? "unknown",
          });
        }
        return next;
      });
      for (const item of items) {
        socket?.send({
          type: "STOCK_DELTA",
          variantId: item.variantId,
          delta: -item.quantity,
          sourceId: socket.sourceId,
        });
      }
    },
    []
  );

  const value = useMemo<InventoryContextValue>(
    () => ({ status, getLiveStock, broadcastPurchase }),
    [status, getLiveStock, broadcastPurchase]
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within an InventoryProvider");
  return ctx;
}
