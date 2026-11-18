import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { sortPayments, type SortKey } from "../lib/payments/query";
import type { Payment } from "../lib/payments/types";
import { amountsOnPage, type ApiPayment, bodyRows, DAY_MS, footer, loadPayments, major, MOCK_DATE, MOCK_NOW, openPayments, pill } from "./helpers";

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

  const searchCases: [string, (p: ApiPayment) => string][] = [
    ["card last 4", (p) => p.method.last4],
    ["email", (p) => p.customerEmail],
    ["payment id", (p) => p.id],
  ];
  for (const [label, pick] of searchCases) {
    test(`search by ${label} shows only matching rows`, async ({ page, request }) => {
      const data = await loadPayments(request);
      const term = pick(data[0]);
      const t = term.toLowerCase();
      const hits = data.filter(
        (p) =>
          p.id.toLowerCase().includes(t) ||
          p.customerEmail.toLowerCase().includes(t) ||
          p.customerName.toLowerCase().includes(t) ||
          (/^\d{1,4}$/.test(t) && p.method.last4.endsWith(t)),
      );
      expect(hits.length).toBeGreaterThan(0);
      await openPayments(page);
      await page.getByRole("textbox", { name: "Search" }).fill(term);
      await expect(page).toHaveURL((u) => u.searchParams.get("q") === term);
      await expect(footer(page)).toContainText(`of ${hits.length} results`);
      await expect(bodyRows(page)).toHaveCount(Math.min(hits.length, 25));
      if (label === "card last 4") expect(await bodyRows(page).filter({ hasText: `\u2022\u2022\u2022\u2022 ${term}` }).count()).toBeGreaterThan(0);
      if (label === "email") await expect(bodyRows(page).first().locator("td[data-col='customer']")).toContainText(term);
      if (label === "payment id") await expect(bodyRows(page)).toHaveCount(hits.length);
    });
  }
});

test.describe("sort and paging", () => {
  const sortCases: { key: SortKey }[] = [
    { key: "created" },
    { key: "amount" },
    { key: "status" },
  ];
  for (const { key } of sortCases) {
    test(`sort by ${key} matches app semantics asc and desc`, async ({ page, request }) => {
      const data = await loadPayments(request);
      for (const dir of ["asc", "desc"] as const) {
        await page.goto(`/payments?sort=${key}.${dir}`);
        await expect(page.getByRole("button", { name: "Export" })).not.toHaveAttribute("aria-disabled", "true");
        await expect(page.locator("th[data-col='" + key + "']")).toHaveAttribute("aria-sort", dir === "asc" ? "ascending" : "descending");
        const expected = sortPayments(data as unknown as Payment[], [{ id: key, desc: dir === "desc" }]).slice(0, 25);
        await expect(bodyRows(page)).toHaveCount(25);
        const emails = await bodyRows(page).locator("td[data-col='customer']").allTextContents();
        expect(emails.map((e) => e.trim())).toEqual(expected.map((p) => p.customerEmail));
        expect(await amountsOnPage(page)).toEqual(expected.map(major));
      }
    });
  }

  for (const size of [25, 50, 100]) {
    test(`page size ${size} shows ${size} rows`, async ({ page, request }) => {
      const total = (await loadPayments(request)).length;
      await openPayments(page);
      await page.getByLabel("Rows per page").selectOption(String(size));
      await expect(bodyRows(page)).toHaveCount(size);
      await expect(footer(page)).toHaveText(`Viewing 1\u2013${size} of ${total} results`);
      if (size !== 25) await expect(page).toHaveURL(new RegExp(`size=${size}`));
    });
  }
});

test.describe("row interactions", () => {
  test("copy payment ID writes to the clipboard and confirms", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await openPayments(page);
    const row = bodyRows(page).first();
    await row.hover();
    await row.getByRole("button", { name: "Copy payment ID" }).click();
    await expect(row.getByText("Copied")).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Payment ID copied" })).toHaveCount(1);
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
  expect(download.suggestedFilename()).toBe(`payments-${MOCK_DATE}.csv`);
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

  test("typing, filtering and sorting make no server (RSC) requests", async ({ page }) => {
    await openPayments(page);
    const rsc: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("_rsc=")) rsc.push(r.url());
    });
    await page.getByRole("textbox", { name: "Search" }).pressSequentially("ab", { delay: 30 });
    await expect(page).toHaveURL((u) => u.searchParams.get("q") === "ab");
    await page.getByRole("tab", { name: "Failed" }).click();
    await expect(page).toHaveURL(/tab=failed/);
    await page.getByRole("columnheader", { name: "Amount" }).getByRole("button").click();
    await expect(page).toHaveURL(/sort=amount/);
    await page.waitForTimeout(500);
    expect(rsc).toEqual([]);
  });

  test("the details breadcrumb returns to the filtered list", async ({ page }) => {
    await openPayments(page, "?tab=succeeded&size=50");
    await bodyRows(page).first().locator("td[data-col='description']").click();
    await expect(page).toHaveURL(/\/payments\/pi_/);
    await page.getByRole("link", { name: "Payments" }).first().click();
    await expect(page).toHaveURL(/tab=succeeded&size=50/);
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
