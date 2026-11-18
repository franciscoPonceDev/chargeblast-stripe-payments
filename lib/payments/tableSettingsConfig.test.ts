import { afterEach, describe, expect, it } from "vitest";
import { SETTINGS_STYLE_ID, settingsScript, TABLE_SETTINGS_KEY } from "./tableSettingsConfig";

const run = () => new Function(settingsScript())();
const css = () => document.getElementById(SETTINGS_STYLE_ID)?.textContent ?? null;

afterEach(() => {
  localStorage.clear();
  document.getElementById(SETTINGS_STYLE_ID)?.remove();
});

describe("settingsScript", () => {
  it("adds nothing without saved settings", () => {
    run();
    expect(css()).toBeNull();
  });

  it("hides saved columns and applies wrap before React renders", () => {
    localStorage.setItem(TABLE_SETTINGS_KEY, JSON.stringify({ hidden: ["paymentId", "customer"], wrap: true }));
    run();
    expect(css()).toContain('[data-col="paymentId"]{display:none}');
    expect(css()).toContain('[data-col="customer"]{display:none}');
    expect(css()).toContain("white-space:normal");
  });

  it("ignores unknown, locked and malformed entries", () => {
    localStorage.setItem(TABLE_SETTINGS_KEY, JSON.stringify({ hidden: ['x"]{}', "amount", 3], wrap: "yes" }));
    run();
    expect(css()).toBeNull();
    localStorage.setItem(TABLE_SETTINGS_KEY, "{not json");
    expect(() => run()).not.toThrow();
  });
});
