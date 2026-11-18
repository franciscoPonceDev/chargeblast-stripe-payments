import { expect, test, type Page } from "@playwright/test";
import { bodyRows, openPayments, pill } from "./helpers";

// Pin the banner A/B variant so the screenshot does not depend on the random assignment.
test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([{ name: "ab_banner", value: "a", url: baseURL! }]);
});

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(0, 0);
}

test("payments default", async ({ page }) => {
  await openPayments(page);
  await settle(page);
  await expect(page).toHaveScreenshot("payments-default.png");
});

test("status filter popover open", async ({ page }) => {
  await openPayments(page);
  await pill(page, "Status").click();
  await expect(page.getByRole("heading", { name: "Filter by status" })).toBeVisible();
  await expect(page).toHaveScreenshot("status-filter-popover.png");
});

test("row hover", async ({ page }) => {
  await openPayments(page);
  await bodyRows(page).nth(2).hover();
  await expect(bodyRows(page).nth(2).locator("td div[aria-hidden='true']")).toHaveCSS("opacity", "1");
  await expect(page).toHaveScreenshot("row-hover.png");
});
