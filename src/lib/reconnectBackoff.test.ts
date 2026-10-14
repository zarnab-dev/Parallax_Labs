import { describe, expect, it } from "vitest";
import { computeBackoffDelay } from "./reconnectBackoff";

describe("computeBackoffDelay", () => {
  it("returns the base delay for the first attempt", () => {
    expect(computeBackoffDelay(0, { baseMs: 1000 })).toBe(1000);
  });

  it("doubles the delay for each subsequent attempt", () => {
    expect(computeBackoffDelay(1, { baseMs: 1000 })).toBe(2000);
    expect(computeBackoffDelay(2, { baseMs: 1000 })).toBe(4000);
    expect(computeBackoffDelay(3, { baseMs: 1000 })).toBe(8000);
  });

  it("caps the delay at maxMs", () => {
    expect(computeBackoffDelay(10, { baseMs: 1000, maxMs: 30000 })).toBe(30000);
  });

  it("respects a custom growth factor", () => {
    expect(computeBackoffDelay(2, { baseMs: 500, factor: 3 })).toBe(4500);
  });

  it("treats a negative attempt as the base delay", () => {
    expect(computeBackoffDelay(-1, { baseMs: 750 })).toBe(750);
  });

  it("uses sensible defaults when no options are given", () => {
    expect(computeBackoffDelay(0)).toBe(1000);
    expect(computeBackoffDelay(5)).toBe(30000); // capped by default maxMs
  });
});
