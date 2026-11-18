import { describe, expect, it } from "vitest";
import { assignVariant, BANNER_CTA, parseVariant } from "./experiments";

describe("experiments", () => {
  it("assignVariant splits at 0.5", () => {
    expect(assignVariant(0)).toBe("a");
    expect(assignVariant(0.4999)).toBe("a");
    expect(assignVariant(0.5)).toBe("b");
    expect(assignVariant(0.9999)).toBe("b");
  });
  it("parseVariant rejects junk", () => {
    expect(parseVariant("b")).toBe("b");
    expect(parseVariant("c")).toBeNull();
    expect(parseVariant(undefined)).toBeNull();
  });
  it("has copy for both variants", () => {
    expect(BANNER_CTA).toEqual({ a: "Get started", b: "Explore Sigma" });
  });
});
