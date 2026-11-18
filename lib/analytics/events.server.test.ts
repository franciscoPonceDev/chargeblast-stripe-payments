// @vitest-environment node
import { describe, expect, it } from "vitest";
import { track } from "./events";

describe("track on the server", () => {
  it("is a no-op without window", () => {
    expect(typeof window).toBe("undefined");
    expect(() => track("banner_dismissed", {})).not.toThrow();
  });
});
