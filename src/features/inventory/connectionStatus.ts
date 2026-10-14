export type ConnectionStatus = "connecting" | "open" | "reconnecting" | "closed";

export type ConnectionEvent =
  | { type: "CONNECTING" }
  | { type: "OPEN" }
  | { type: "DISCONNECTED" }
  | { type: "RECONNECT_ATTEMPT" };

/**
 * Pure state transition for the socket's connection status, kept separate
 * from the actual socket/timer side effects so the transition logic itself
 * is trivially unit-testable.
 */
export function connectionStatusReducer(
  status: ConnectionStatus,
  event: ConnectionEvent
): ConnectionStatus {
  switch (event.type) {
    case "CONNECTING":
      return "connecting";
    case "OPEN":
      return "open";
    case "DISCONNECTED":
      return status === "open" || status === "connecting" ? "reconnecting" : "closed";
    case "RECONNECT_ATTEMPT":
      return "reconnecting";
    default:
      return status;
  }
}
