import { describe, it, expect } from "vitest";
import { newDeviceId, isValidDeviceId } from "@/lib/device";

describe("newDeviceId", () => {
  it("returns a uuid v4-shaped string", () => {
    const id = newDeviceId();
    expect(isValidDeviceId(id)).toBe(true);
  });

  it("returns distinct values", () => {
    expect(newDeviceId()).not.toBe(newDeviceId());
  });
});

describe("isValidDeviceId", () => {
  it("rejects non-uuids", () => {
    expect(isValidDeviceId("nope")).toBe(false);
    expect(isValidDeviceId("")).toBe(false);
  });
});
