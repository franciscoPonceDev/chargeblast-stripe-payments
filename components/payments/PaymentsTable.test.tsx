import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SortState } from "@/lib/payments/query";
import type { Payment, PaymentStatus } from "@/lib/payments/types";
import { PaymentsTable, EMPTY_MESSAGE } from "./PaymentsTable";
import { StatusBadge } from "./StatusBadge";

const NOW = Date.UTC(2026, 10, 17, 18, 0, 0);
const mk = (i: number, over: Partial<Payment> = {}): Payment => ({
  id: `pi_${String(i).repeat(24)}`,
  amount: 1234 * i,
  currency: "usd",
  status: "succeeded",
  disputed: false,
  method: { type: "card", brand: "visa", wallet: null, bankName: null, last4: "4242" },
  description: "Subscription update",
  customerEmail: `c${i}@example.com`,
  customerName: `C${i}`,
  created: NOW - 3600_000 * i,
  refundedAt: null,
  declineReason: null,
  ...over,
});
const rows = [mk(1), mk(2), mk(3)];
const DEFAULT: SortState[] = [{ id: "created", desc: true }];

function setup(over: { rows?: Payment[]; sort?: SortState[] } = {}) {
  const onSortChange = vi.fn();
  render(
    <PaymentsTable rows={over.rows ?? rows} sort={over.sort ?? DEFAULT} onSortChange={onSortChange} now={NOW} />,
  );
  return onSortChange;
}

const origClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
afterEach(() => {
  vi.useRealTimers();
  if (origClipboard) Object.defineProperty(navigator, "clipboard", origClipboard);
  else delete (navigator as unknown as Record<string, unknown>).clipboard;
});

describe("PaymentsTable", () => {
  it("renders header labels in order", () => {
    setup();
    const labels = screen.getAllByRole("columnheader").map((h) => h.textContent);
    expect(labels.filter(Boolean)).toEqual([
      "Amount", "Status", "Payment ID", "Payment method", "Description", "Customer", "Date",
      "Refunded date", "Decline reason", "Actions",
    ]);
  });

  it("renders one body row per payment", () => {
    setup();
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("shows empty state", () => {
    setup({ rows: [] });
    expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument();
  });

  it("click Amount sorts desc, replacing others", async () => {
    const onSortChange = setup();
    await userEvent.click(screen.getByRole("button", { name: "Amount" }));
    expect(onSortChange).toHaveBeenCalledWith([{ id: "amount", desc: true }]);
  });

  it("shift-click Date appends", () => {
    const onSortChange = setup({ sort: [{ id: "amount", desc: true }] });
    fireEvent.click(screen.getByRole("button", { name: "Date" }), { shiftKey: true });
    expect(onSortChange).toHaveBeenCalledWith([
      { id: "amount", desc: true },
      { id: "created", desc: true },
    ]);
  });

  it("desc click goes to asc", async () => {
    const a = setup({ sort: [{ id: "amount", desc: true }] });
    await userEvent.click(screen.getByRole("button", { name: "Amount" }));
    expect(a).toHaveBeenCalledWith([{ id: "amount", desc: false }]);
  });

  it("asc click restores default sort; aria-sort set", async () => {
    const a = setup({ sort: [{ id: "amount", desc: false }] });
    expect(screen.getByRole("columnheader", { name: "Amount" })).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(screen.getByRole("button", { name: "Amount" }));
    expect(a).toHaveBeenCalledWith(DEFAULT);
  });

  it("method cell shows last4", () => {
    setup();
    expect(screen.getAllByText("•••• 4242")).toHaveLength(3);
  });

  it("ACH and wallet methods", () => {
    setup({
      rows: [
        mk(1, { method: { type: "ach", brand: null, wallet: null, bankName: "Chase", last4: "6789" } }),
        mk(2, { method: { type: "wallet", brand: "mastercard", wallet: "apple_pay", bankName: null, last4: "1111" } }),
      ],
    });
    expect(screen.getByText("•••• 6789")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Apple Pay" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "mastercard" })).toBeInTheDocument();
  });

  it("shows dashes for null refunded/decline", () => {
    setup({ rows: [mk(1)] });
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("hovering the date shows relative tooltip", async () => {
    setup({ rows: [mk(1)] });
    await userEvent.hover(screen.getByText("Nov 17, 5:00 PM"));
    expect((await screen.findAllByText("1 hour ago")).length).toBeGreaterThan(0);
  });

  it("header checkbox selects all rows", async () => {
    setup();
    await userEvent.click(screen.getByRole("checkbox", { name: "Select all payments" }));
    for (const cb of screen.getAllByRole("checkbox")) expect(cb).toHaveAttribute("aria-checked", "true");
  });

  it("copy button writes full id and shows Copied", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    setup({ rows: [mk(1)] });
    await userEvent.click(screen.getByRole("button", { name: "Copy payment ID" }));
    expect(writeText).toHaveBeenCalledWith(mk(1).id);
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("copy without clipboard does not throw or show Copied", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    setup({ rows: [mk(1)] });
    await userEvent.click(screen.getByRole("button", { name: "Copy payment ID" }));
    expect(screen.queryByText("Copied")).toBeNull();
  });

  it("copy rejection shows nothing", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("no"));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    setup({ rows: [mk(1)] });
    await userEvent.click(screen.getByRole("button", { name: "Copy payment ID" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    await act(async () => {});
    expect(screen.queryByText("Copied")).toBeNull();
  });

  it("Copied disappears after 1.5s", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    setup({ rows: [mk(1)] });
    fireEvent.click(screen.getByRole("button", { name: "Copy payment ID" }));
    expect(await screen.findByText("Copied")).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(1600);
    });
    expect(screen.queryByText("Copied")).toBeNull();
  });

  it("shift-click on desc column toggles to asc in place", () => {
    const a = setup({ sort: [{ id: "amount", desc: true }, { id: "created", desc: true }] });
    fireEvent.click(screen.getByRole("button", { name: "Amount" }), { shiftKey: true });
    expect(a).toHaveBeenCalledWith([{ id: "amount", desc: false }, { id: "created", desc: true }]);
  });

  it("shift-click on asc column removes it", () => {
    const a = setup({ sort: [{ id: "amount", desc: false }, { id: "created", desc: true }] });
    fireEvent.click(screen.getByRole("button", { name: "Amount" }), { shiftKey: true });
    expect(a).toHaveBeenCalledWith([{ id: "created", desc: true }]);
  });

  it("shift-click removing the only sort restores default", () => {
    const a = setup({ sort: [{ id: "amount", desc: false }] });
    fireEvent.click(screen.getByRole("button", { name: "Amount" }), { shiftKey: true });
    expect(a).toHaveBeenCalledWith(DEFAULT);
  });

  it("plain click on another column while multi-sorted gives single sort", async () => {
    const a = setup({ sort: [{ id: "amount", desc: true }, { id: "created", desc: true }] });
    await userEvent.click(screen.getByRole("button", { name: "Status" }));
    expect(a).toHaveBeenCalledWith([{ id: "status", desc: true }]);
  });

  it("aria-sort only on primary column", () => {
    setup({ sort: [{ id: "amount", desc: true }, { id: "created", desc: true }] });
    expect(screen.getByRole("columnheader", { name: "Amount" })).toHaveAttribute("aria-sort", "descending");
    expect(screen.getByRole("columnheader", { name: "Date" })).not.toHaveAttribute("aria-sort");
  });

  it("selection survives re-sort and is pruned when rows disappear", async () => {
    const onSortChange = vi.fn();
    const id0 = rows[0].id;
    const { rerender } = render(<PaymentsTable rows={rows} sort={DEFAULT} onSortChange={onSortChange} now={NOW} />);
    await userEvent.click(screen.getByRole("checkbox", { name: `Select payment ${id0}` }));
    rerender(<PaymentsTable rows={[...rows].reverse()} sort={DEFAULT} onSortChange={onSortChange} now={NOW} />);
    expect(screen.getByRole("checkbox", { name: `Select payment ${id0}` })).toHaveAttribute("aria-checked", "true");
    rerender(<PaymentsTable rows={[rows[1], rows[2]]} sort={DEFAULT} onSortChange={onSortChange} now={NOW} />);
    rerender(<PaymentsTable rows={rows} sort={DEFAULT} onSortChange={onSortChange} now={NOW} />);
    expect(screen.getByRole("checkbox", { name: `Select payment ${id0}` })).toHaveAttribute("aria-checked", "false");
  });

  it("badge text per status", () => {
    const labels: Record<PaymentStatus, string> = {
      succeeded: "Succeeded", pending: "Pending", failed: "Failed",
      refunded: "Refunded", canceled: "Canceled", blocked: "Blocked",
    };
    for (const [s, l] of Object.entries(labels)) {
      const { unmount } = render(<StatusBadge status={s as PaymentStatus} />);
      expect(screen.getByText(l)).toBeInTheDocument();
      unmount();
    }
  });
});
