import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const ci = !!process.env.CI;
const desktop = { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, ...(ci ? {} : { channel: "chrome" as const }) };

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  workers: ci ? 2 : undefined,
  reporter: ci ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: { baseURL, trace: "retain-on-failure", timezoneId: "UTC", locale: "en-US" },
  expect: { toHaveScreenshot: { animations: "disabled", maxDiffPixelRatio: 0.002 } },
  projects: [
    { name: "chromium", testIgnore: /visual\.spec\.ts/, use: desktop },
    // Visual baselines are OS/font specific (win32 committed); CI runs only the chromium project.
    { name: "visual", testMatch: /visual\.spec\.ts/, use: desktop },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run build && npm run start -- -p ${PORT}`,
        url: `http://localhost:${PORT}/payments`,
        reuseExistingServer: !ci,
        timeout: 300_000,
      },
});
