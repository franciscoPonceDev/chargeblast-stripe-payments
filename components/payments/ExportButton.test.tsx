import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { DEFAULT_QUERY } from "@/lib/payments/query";
import type { Payment } from "@/lib/payments/types";
import { ExportButton } from "./ExportButton";

const NOW = Date.UTC(2026, 10, 17, 18, 0, 0);
const mk = (i: number, status: Payment["status"]): Payment => ({
  id: `pi_${String(i).repeat(24)}`,
  amount: 1000 * i,
  currency: "usd",
  status,
  disputed: false,
  method: { type: "card", brand: "visa", wallet: null, bankName: null, last4: "4242" },
  description: "Subscription update",
  customerEmail: `c${i}@example.com`,
  customerName: `C${i}`,
  created: NOW - 3600_000 * i,
  refundedAt: null,
  declineReason: null,
});
// 30 rows so the default 25-row page would cut the export short.
const all = Array.from({ length: 30 }, (_, i) => mk(i + 1, i % 3 === 0 ? "failed" : "succeeded"));
const failedCount = all.filter((p) => p.status === "failed").length;

describe("ExportButton", () => {
  let blobs: Blob[];
  let click: ReturnType<typeof vi.spyOn>;
  let revoke: Mock<(url: string) => void>;
  beforeEach(() => {
    blobs = [];
    revoke = vi.fn<(url: string) => void>();
    URL.createObjectURL = vi.fn((b: Blob) => (blobs.push(b), "blob:x"));
    URL.revokeObjectURL = revoke;
    click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("downloads the filtered view across all pages, then revokes the URL", async () => {
    render(<ExportButton all={all} status="ready" query={{ ...DEFAULT_QUERY, tab: "failed", pageSize: 25 }} now={NOW} />);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    await waitFor(() => expect(revoke).toHaveBeenCalledWith("blob:x"));
    const lines = (await blobs[0].text()).trim().split("\r\n");
    expect(lines).toHaveLength(1 + failedCount);
    expect(lines[0]).toMatch(/^id,created,amount/);
    expect(lines.slice(1).every((l) => l.includes(",Failed,"))).toBe(true);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("exports every page of an unfiltered query", async () => {
    render(<ExportButton all={all} status="ready" query={DEFAULT_QUERY} now={NOW} />);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    await waitFor(() => expect(blobs).toHaveLength(1));
    expect((await blobs[0].text()).trim().split("\r\n")).toHaveLength(31);
  });

  it("names the file payments-YYYY-MM-DD.csv", async () => {
    let name = "";
    click.mockImplementation(function (this: HTMLAnchorElement) {
      name = this.download;
    });
    render(<ExportButton all={all} status="ready" query={DEFAULT_QUERY} now={NOW} />);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    await waitFor(() => expect(name).toMatch(/^payments-\d{4}-\d{2}-\d{2}\.csv$/));
  });

  it.each([
    ["loading", null, "Loading payments…"],
    ["error", null, "Couldn't load payments"],
  ] as const)("is disabled while %s", (status, rows, reason) => {
    render(<ExportButton all={rows} status={status} query={DEFAULT_QUERY} now={NOW} />);
    const btn = screen.getByRole("button", { name: "Export" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-description", reason);
    expect(btn).toHaveAttribute("title", reason);
  });
});
