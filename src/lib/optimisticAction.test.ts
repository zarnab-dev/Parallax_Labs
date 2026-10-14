import { describe, expect, it, vi } from "vitest";
import { runOptimisticAction } from "./optimisticAction";

describe("runOptimisticAction", () => {
  it("applies the change immediately, before sync resolves", async () => {
    const order: string[] = [];
    const apply = vi.fn(() => order.push("apply"));
    const sync = vi.fn(async () => {
      order.push("sync");
    });

    await runOptimisticAction({ apply, sync, rollback: vi.fn() });

    expect(order).toEqual(["apply", "sync"]);
  });

  it("does not roll back when sync succeeds", async () => {
    const rollback = vi.fn();
    await runOptimisticAction({
      apply: vi.fn(),
      sync: () => Promise.resolve(),
      rollback,
    });

    expect(rollback).not.toHaveBeenCalled();
  });

  it("rolls back and reports the error when sync rejects", async () => {
    const rollback = vi.fn();
    const onError = vi.fn();

    await runOptimisticAction({
      apply: vi.fn(),
      sync: () => Promise.reject(new Error("Inventory changed")),
      rollback,
      onError,
    });

    expect(rollback).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith("Inventory changed");
  });

  it("falls back to a generic message for non-Error rejections", async () => {
    const onError = vi.fn();

    await runOptimisticAction({
      apply: vi.fn(),
      sync: () => Promise.reject("network down"),
      rollback: vi.fn(),
      onError,
    });

    expect(onError).toHaveBeenCalledWith(
      "Something went wrong. Your change was reverted."
    );
  });

  it("never calls rollback before apply", async () => {
    const calls: string[] = [];
    await runOptimisticAction({
      apply: () => calls.push("apply"),
      sync: () => Promise.reject(new Error("fail")),
      rollback: () => calls.push("rollback"),
    });

    expect(calls).toEqual(["apply", "rollback"]);
  });

  it("keeps the applied state intact when sync succeeds (integration-style)", async () => {
    let value = 0;
    const previous = value;

    await runOptimisticAction({
      apply: () => {
        value = 5;
      },
      sync: () => Promise.resolve(),
      rollback: () => {
        value = previous;
      },
    });

    expect(value).toBe(5);
  });

  it("restores the exact prior state on rollback (integration-style)", async () => {
    let value = 0;
    const previous = value;

    await runOptimisticAction({
      apply: () => {
        value = 5;
      },
      sync: () => Promise.reject(new Error("rejected")),
      rollback: () => {
        value = previous;
      },
    });

    expect(value).toBe(0);
  });
});
