import { describe, expect, it } from "vitest";
import { connectionStatusReducer } from "./connectionStatus";

describe("connectionStatusReducer", () => {
  it("moves to connecting on CONNECTING", () => {
    expect(connectionStatusReducer("closed", { type: "CONNECTING" })).toBe(
      "connecting"
    );
  });

  it("moves to open on OPEN", () => {
    expect(connectionStatusReducer("connecting", { type: "OPEN" })).toBe(
      "open"
    );
  });

  it("moves from open to reconnecting on DISCONNECTED", () => {
    expect(connectionStatusReducer("open", { type: "DISCONNECTED" })).toBe(
      "reconnecting"
    );
  });

  it("moves from connecting to reconnecting on DISCONNECTED", () => {
    expect(connectionStatusReducer("connecting", { type: "DISCONNECTED" })).toBe(
      "reconnecting"
    );
  });

  it("stays closed if already closed and DISCONNECTED fires again", () => {
    expect(connectionStatusReducer("closed", { type: "DISCONNECTED" })).toBe(
      "closed"
    );
  });

  it("moves to reconnecting on RECONNECT_ATTEMPT", () => {
    expect(
      connectionStatusReducer("closed", { type: "RECONNECT_ATTEMPT" })
    ).toBe("reconnecting");
  });

  it("a full disconnect-and-recover cycle ends back at open", () => {
    let status = connectionStatusReducer("closed", { type: "CONNECTING" });
    status = connectionStatusReducer(status, { type: "OPEN" });
    status = connectionStatusReducer(status, { type: "DISCONNECTED" });
    status = connectionStatusReducer(status, { type: "RECONNECT_ATTEMPT" });
    status = connectionStatusReducer(status, { type: "OPEN" });
    expect(status).toBe("open");
  });
});
