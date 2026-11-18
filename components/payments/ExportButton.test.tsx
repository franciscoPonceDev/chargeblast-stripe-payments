import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { DEFAULT_QUERY } from "@/lib/payments/query";
import type { Payment } from "@/lib/payments/types";
import { ExportButton } from "./ExportButton";

const csvFail = vi.hoisted(() => ({ on: false }));
vi.mock("@/lib/payments/csv", async (orig) => {
  const real = await orig<typeof import("@/lib/payments/csv")>();
  return {
    ...real,
    toCsv: (rows: Payment[]) => {
      if (csvFail.on) throw new Error("boom");
      return real.toCsv(rows);
    },
  };
});

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
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    csvFail.on = false;
  });

  it("downloads the filtered view across all pages, then revokes the URL after a delay", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<ExportButton all={all} status="ready" query={{ ...DEFAULT_QUERY, tab: "failed", pageSize: 25 }} now={NOW} />);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    await waitFor(() => expect(blobs).toHaveLength(1));
    const lines = (await blobs[0].text()).trim().split("\r\n");
    expect(lines).toHaveLength(1 + failedCount);
    expect(lines[0]).toMatch(/^id,created,amount/);
    expect(lines.slice(1).every((l) => l.includes(",Failed,"))).toBe(true);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revoke).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });
    expect(revoke).toHaveBeenCalledWith("blob:x");
  });

  it("exports every page of an unfiltered query", async () => {
    render(<ExportButton all={all} status="ready" query={DEFAULT_QUERY} now={NOW} />);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    await waitFor(() => expect(blobs).toHaveLength(1));
    expect((await blobs[0].text()).trim().split("\r\n")).toHaveLength(31);
  });

  it("honours the query's sort order", async () => {
    render(<ExportButton all={all} status="ready" query={{ ...DEFAULT_QUERY, sort: [{ id: "amount", desc: true }] }} now={NOW} />);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    await waitFor(() => expect(blobs).toHaveLength(1));
    const amounts = (await blobs[0].text()).trim().split("\r\n").slice(1).map((l) => Number(l.split(",")[2]));
    expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
    expect(amounts[0]).toBe(300);
  });

  it("names the file from the now prop", async () => {
    let name = "";
    click.mockImplementation(function (this: HTMLAnchorElement) {
      name = this.download;
    });
    render(<ExportButton all={all} status="ready" query={DEFAULT_QUERY} now={NOW} />);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    await waitFor(() => expect(name).toBe("payments-2026-11-17.csv"));
  });

  it("makes one download for a double click", async () => {
    render(<ExportButton all={all} status="ready" query={DEFAULT_QUERY} now={NOW} />);
    const btn = screen.getByRole("button", { name: "Export" });
    fireEvent.click(btn);
    fireEvent.click(btn);
    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("shows an inline message when the export fails, and clears it on a successful retry", async () => {
    csvFail.on = true;
    render(<ExportButton all={all} status="ready" query={DEFAULT_QUERY} now={NOW} />);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Couldn't export payments. Try again.");
    expect(click).not.toHaveBeenCalled();
    csvFail.on = false;
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it.each([
    ["loading", "Loading payments…"],
    ["error", "Couldn't load payments"],
  ] as const)("is aria-disabled, focusable and described while %s, and does not download", async (status, reason) => {
    render(<ExportButton all={null} status={status} query={DEFAULT_QUERY} now={NOW} />);
    const btn = screen.getByRole("button", { name: "Export" });
    expect(btn).toHaveAttribute("aria-disabled", "true");
    expect(btn).not.toBeDisabled();
    expect(btn).toHaveAccessibleDescription(reason);
    btn.focus();
    expect(btn).toHaveFocus();
    await userEvent.click(btn);
    expect(blobs).toHaveLength(0);
    expect(click).not.toHaveBeenCalled();
  });
});
