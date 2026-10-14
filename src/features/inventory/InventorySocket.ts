import { computeBackoffDelay } from "@/lib/reconnectBackoff";
import type { ConnectionStatus } from "./connectionStatus";
import type { InventoryMessage } from "./inventoryReducer";

const CHANNEL_NAME = "northlinegoods-inventory";

// Purely for demonstrating reconnection: every interval, there's a small
// chance the "connection" is simulated as dropped. A real deployment would
// remove this and rely on genuine network conditions.
const SIMULATED_DROP_CHECK_MS = 12000;
const SIMULATED_DROP_PROBABILITY = 0.25;

export interface InventorySocketHandlers {
  onStatusChange: (status: ConnectionStatus) => void;
  onMessage: (message: InventoryMessage) => void;
}

/**
 * Behaves like a real WebSocket client (connect, reconnect with backoff,
 * status callbacks) but is backed by BroadcastChannel, which is the correct
 * browser primitive for same-origin cross-tab messaging and doesn't require
 * a server this project doesn't have. See README "Key technical decisions".
 */
export class InventorySocket {
  readonly sourceId: string;
  private channel: BroadcastChannel | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private dropCheckTimer: ReturnType<typeof setInterval> | null = null;
  private closedByClient = false;

  constructor(private handlers: InventorySocketHandlers) {
    this.sourceId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `tab-${Math.random().toString(36).slice(2)}`;
  }

  connect(): void {
    this.closedByClient = false;
    this.handlers.onStatusChange(this.reconnectAttempt > 0 ? "reconnecting" : "connecting");

    // Simulated connection latency.
    setTimeout(() => {
      if (this.closedByClient) return;
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<InventoryMessage>) => {
          if (event.data?.sourceId === this.sourceId) return; // ignore our own broadcasts
          this.handlers.onMessage(event.data);
        };
        this.reconnectAttempt = 0;
        this.handlers.onStatusChange("open");
        this.startDropSimulation();
      } catch {
        this.scheduleReconnect();
      }
    }, 300);
  }

  send(message: InventoryMessage): void {
    // Fire-and-forget by design: cart/checkout logic must never wait on or
    // fail because of the inventory socket (see "socket drops mid-checkout"
    // handling in the Week 4 README section).
    try {
      this.channel?.postMessage(message);
    } catch {
      // Swallow — a dropped broadcast just means other tabs miss one live
      // update; it does not affect this tab's own cart/checkout state.
    }
  }

  close(): void {
    this.closedByClient = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.dropCheckTimer) clearInterval(this.dropCheckTimer);
    this.channel?.close();
    this.channel = null;
    this.handlers.onStatusChange("closed");
  }

  private startDropSimulation(): void {
    if (this.dropCheckTimer) clearInterval(this.dropCheckTimer);
    this.dropCheckTimer = setInterval(() => {
      if (Math.random() < SIMULATED_DROP_PROBABILITY) {
        this.handleDisconnect();
      }
    }, SIMULATED_DROP_CHECK_MS);
  }

  private handleDisconnect(): void {
    if (this.closedByClient) return;
    if (this.dropCheckTimer) clearInterval(this.dropCheckTimer);
    this.channel?.close();
    this.channel = null;
    this.handlers.onStatusChange("reconnecting");
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.closedByClient) return;
    const delay = computeBackoffDelay(this.reconnectAttempt);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.handlers.onStatusChange("reconnecting");
      this.connect();
    }, delay);
  }
}
