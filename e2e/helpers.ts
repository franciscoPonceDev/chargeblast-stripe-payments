import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";

export const MOCK_NOW = Date.UTC(2026, 10, 17, 18, 0, 0);
export const DAY_MS = 86_400_000;

export interface ApiPayment {
  id: string;
  amount: number;
  currency: "usd" | "gbp" | "eur" | "brl" | "cad" | "jpy";
  status: string;
  disputed: boolean;
  method: { last4: string };
  customerEmail: string;
  customerName: string;
  created: number;
}

export async function loadPayments(request: APIRequestContext): Promise<ApiPayment[]> {
  const res = await request.get("/api/payments");
  expect(res.ok()).toBe(true);
  return res.json();
}

export const major = (p: ApiPayment) => (p.currency === "jpy" ? p.amount : p.amount / 100);

export const bodyRows = (page: Page): Locator => page.locator("table[data-payments-table] tbody tr");
export const footer = (page: Page): Locator => page.getByText(/^Viewing /);

/** Goes to /payments and waits for hydration plus the full dataset (Export enables when it has loaded). */
export async function openPayments(page: Page, search = ""): Promise<void> {
  await page.goto(`/payments${search}`);
  await expect(page.getByRole("button", { name: "Export" })).not.toHaveAttribute("aria-disabled", "true");
}

export async function amountsOnPage(page: Page): Promise<number[]> {
  const texts = await page.locator("table[data-payments-table] tbody td[data-col='amount']").allTextContents();
  return texts.map((t) => Number(t.replace(/[^\d.]/g, "")));
}

/** Filter pill trigger; the sortable table headers share names such as "Status" and "Amount". */
export const pill = (page: Page, name: string): Locator => page.locator('button[aria-haspopup="dialog"]').filter({ hasText: name });

export const MOCK_DATE = new Date(MOCK_NOW).toISOString().slice(0, 10);
