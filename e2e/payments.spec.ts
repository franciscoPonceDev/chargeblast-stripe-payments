import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { amountsOnPage, bodyRows, DAY_MS, footer, loadPayments, major, MOCK_NOW, openPayments, pill } from "./helpers";

test.describe("filters", () => {
  test("status filter updates rows, count and URL", async ({ page, request }) => {
    const data = await loadPayments(request);
    const expected = data.filter((p) => p.status === "failed").length;
    await openPayments(page);
    await pill(page, "Status").click();
    await page.getByRole("checkbox", { name: "Failed" }).click();
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page).toHaveURL(/status=failed/);
    await expect(footer(page)).toContainText(`of ${expected} results`);
    await expect(bodyRows(page)).toHaveCount(Math.min(expected, 25));
    for (const badge of await bodyRows(page).locator("td[data-col='status']").allTextContents()) expect(badge).toContain("Failed");
  });

  test("amount between keeps every visible amount in range", async ({ page, request }) => {
    const data = await loadPayments(request);
    const expected = data.filter((p) => major(p) >= 100 && major(p) <= 500).length;
    await openPayments(page);
    await pill(page, "Amount").click();
    await page.getByLabel("Condition").selectOption("between");
    await page.getByLabel("Minimum").fill("100");
    await page.getByLabel("Maximum").fill("500");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page).toHaveURL(/amount=between%3A100-500/);
    await expect(footer(page)).toContainText(`of ${expected} results`);
    const amounts = await amountsOnPage(page);
    expect(amounts.length).toBeGreaterThan(0);
    for (const a of amounts) {
      expect(a).toBeGreaterThanOrEqual(100);
      expect(a).toBeLessThanOrEqual(500);
    }
  });

  test("date preset last 7 days matches the MOCK_NOW window", async ({ page, request }) => {
    const data = await loadPayments(request);
    const expected = data.filter((p) => p.created >= MOCK_NOW - 7 * DAY_MS).length;
    expect(expected).toBeGreaterThan(0);
    expect(expected).toBeLessThan(data.length);
    await openPayments(page);
    await pill(page, "Date and time").click();
    await page.getByRole("radio", { name: "Last 7 days" }).check();
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page).toHaveURL(/date=7d/);
    await expect(footer(page)).toContainText(`of ${expected} results`);
    await expect(pill(page, "Date and time")).toContainText("Last 7 days");
  });

  test("search by card last 4 shows only matching rows", async ({ page, request }) => {
    const data = await loadPayments(request);
    const last4 = data[0].method.last4;
    const hits = data.filter(
      (p) =>
        p.method.last4.includes(last4) ||
        p.id.toLowerCase().includes(last4) ||
        p.customerEmail.toLowerCase().includes(last4) ||
        p.customerName.toLowerCase().includes(last4),
    );
    await openPayments(page);
    await page.getByRole("textbox", { name: "Search" }).fill(last4);
    await expect(page).toHaveURL(new RegExp(`q=${last4}`));
    await expect(footer(page)).toContainText(`of ${hits.length} results`);
    await expect(bodyRows(page)).toHaveCount(Math.min(hits.length, 25));
    expect(await bodyRows(page).filter({ hasText: `•••• ${last4}` }).count()).toBeGreaterThan(0);
  });
});

test.describe("sort and paging", () => {
  test("sort by amount descending then ascending", async ({ page }) => {
    await openPayments(page);
    const header = page.getByRole("table").getByRole("button", { name: "Amount" });
    await header.click();
    await expect(page).toHaveURL(/sort=amount\.desc/);
    const desc = await amountsOnPage(page);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
    await header.click();
    await expect(page).toHaveURL(/sort=amount\.asc/);
    await expect(page.getByRole("columnheader", { name: "Amount" })).toHaveAttribute("aria-sort", "ascending");
    const asc = await amountsOnPage(page);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(asc[0]).toBeLessThanOrEqual(desc[desc.length - 1]);
  });

  test("page size 50 shows 50 rows", async ({ page }) => {
    await openPayments(page);
    await page.getByLabel("Rows per page").selectOption("50");
    await expect(bodyRows(page)).toHaveCount(50);
    await expect(footer(page)).toHaveText("Viewing 1–50 of 600 results");
    await expect(page).toHaveURL(/size=50/);
  });
});

test.describe("row interactions", () => {
  test("copy payment ID writes to the clipboard and confirms", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await openPayments(page);
    const row = bodyRows(page).first();
    await row.hover();
    await row.getByRole("button", { name: "Copy payment ID" }).click();
    await expect(row.getByRole("status")).toHaveText("Copied");
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toMatch(/^pi_[A-Za-z0-9]{24}$/);
    await expect(page).toHaveURL(/\/payments$/);
  });

  test("row click opens details with amount and timeline", async ({ page }) => {
    await openPayments(page);
    const row = bodyRows(page).first();
    const amount = ((await row.locator("td[data-col='amount']").textContent()) ?? "").trim();
    await row.locator("td[data-col='description']").click();
    await expect(page).toHaveURL(/\/payments\/pi_[A-Za-z0-9]{24}$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(amount);
    await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
    expect(await page.locator("ol li").count()).toBeGreaterThan(0);
    await expect(page.getByRole("heading", { name: "Payment details" })).toBeVisible();
  });

  test("unknown payment id is a 404", async ({ page }) => {
    const res = await page.goto("/payments/pi_doesnotexist");
    expect(res?.status()).toBe(404);
  });
});

test("CSV export downloads the filtered rows", async ({ page, request }) => {
  const data = await loadPayments(request);
  const expected = data.filter((p) => p.status === "refunded").length;
  await openPayments(page, "?status=refunded");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export" }).click()]);
  expect(download.suggestedFilename()).toBe("payments-2026-11-17.csv");
  const lines = readFileSync(await download.path(), "utf8").replace(/^﻿/, "").trim().split("\r\n");
  expect(lines[0]).toBe("id,created,amount,currency,status,payment_method,last4,description,customer_name,customer_email,refunded_at,decline_reason");
  expect(lines.length - 1).toBe(expected);
  for (const l of lines.slice(1)) expect(l).toContain(",Refunded,");
});

test.describe("URL state", () => {
  test("a filtered URL renders the filtered table on first load", async ({ page, request }) => {
    const data = await loadPayments(request);
    const expected = data.filter((p) => p.status === "failed" && p.currency === "usd").length;
    await page.goto("/payments?status=failed&currency=usd&sort=amount.asc");
    await expect(footer(page)).toContainText(`of ${expected} results`);
    await expect(pill(page, "Status")).toContainText("Failed");
    await expect(pill(page, "Currency")).toContainText("USD");
  });

  test("back and forward restore filter state", async ({ page, request }) => {
    const data = await loadPayments(request);
    const count = (s: string) => data.filter((p) => p.status === s).length;
    await openPayments(page, "?status=failed");
    await expect(footer(page)).toContainText(`of ${count("failed")} results`);
    await page.getByRole("tab", { name: "Succeeded" }).click();
    await page.getByRole("button", { name: "Clear Status filter" }).click();
    await expect(footer(page)).toContainText(`of ${count("succeeded")} results`);
    // Filter edits replace the history entry, so travel across a real navigation: list -> details -> back.
    await bodyRows(page).first().locator("td[data-col='description']").click();
    await expect(page).toHaveURL(/\/payments\/pi_/);
    await page.goBack();
    await expect(page).toHaveURL(/tab=succeeded/);
    await expect(footer(page)).toContainText(`of ${count("succeeded")} results`);
    await page.goForward();
    await expect(page).toHaveURL(/\/payments\/pi_/);
  });
});

test("edit columns: hidden column persists across reload", async ({ page }) => {
  await openPayments(page);
  const header = page.getByRole("columnheader", { name: "Customer" });
  await expect(header).toBeVisible();
  await page.getByRole("button", { name: "Edit columns" }).click();
  await page.getByRole("checkbox", { name: "Customer" }).click();
  await expect(header).toBeHidden();
  await page.reload();
  await expect(page.getByRole("columnheader", { name: "Amount" })).toBeVisible();
  await expect(header).toBeHidden();
  await page.getByRole("button", { name: "Edit columns" }).click();
  await expect(page.getByRole("checkbox", { name: "Customer" })).not.toBeChecked();
});
