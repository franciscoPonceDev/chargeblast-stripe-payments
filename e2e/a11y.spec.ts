import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { bodyRows, openPayments, pill } from "./helpers";

async function seriousViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

test("axe: payments default", async ({ page }) => {
  await openPayments(page);
  expect(await seriousViolations(page)).toEqual([]);
});

test("axe: payments with status popover open", async ({ page }) => {
  await openPayments(page);
  await pill(page, "Status").click();
  await expect(page.getByRole("heading", { name: "Filter by status" })).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});

test("axe: payment details", async ({ page }) => {
  await openPayments(page);
  await bodyRows(page).first().locator("td[data-col='description']").click();
  await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});
