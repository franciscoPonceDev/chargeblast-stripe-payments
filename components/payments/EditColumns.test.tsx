import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_QUERY } from "@/lib/payments/query";
import type { Payment } from "@/lib/payments/types";
import { TABLE_SETTINGS_KEY, useTableSettings } from "@/lib/payments/tableSettings";
import { EditColumns } from "./EditColumns";
import { PaymentsTable } from "./PaymentsTable";

const NOW = Date.UTC(2026, 10, 17, 18, 0, 0);
const row: Payment = {
  id: "pi_" + "1".repeat(24),
  amount: 1234,
  currency: "usd",
  status: "failed",
  disputed: false,
  method: { type: "card", brand: "visa", wallet: null, bankName: null, last4: "4242" },
  description: "Subscription update",
  customerEmail: "c1@example.com",
  customerName: "C1",
  created: NOW - 3600_000,
  refundedAt: null,
  declineReason: "card_declined",
};

function Harness({ rows = [row] }: { rows?: Payment[] }) {
  const { settings, setColumnVisible, setWrap, reset } = useTableSettings();
  return (
    <>
      <EditColumns settings={settings} onColumnVisibleChange={setColumnVisible} onWrapChange={setWrap} onReset={reset} />
      <PaymentsTable
        rows={rows}
        sort={DEFAULT_QUERY.sort}
        onSortChange={() => {}}
        now={NOW}
        hiddenColumns={settings.hidden}
        wrap={settings.wrap}
      />
    </>
  );
}

const open = () => userEvent.click(screen.getByRole("button", { name: "Edit columns" }));
const headers = () => screen.getAllByRole("columnheader").map((h) => h.textContent);

beforeEach(() => localStorage.clear());

describe("Edit columns", () => {
  it("opens a labelled panel with the title, switch, Columns label and reset button", async () => {
    render(<Harness />);
    await open();
    expect(screen.getByRole("dialog", { name: "Edit columns" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Wrap cells" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("group", { name: "Columns" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset to default" })).toBeInTheDocument();
  });

  it("hides a column's header and cells when unchecked, and Reset restores it", async () => {
    render(<Harness />);
    expect(headers()).toContain("Decline reason");
    expect(screen.getByText("card_declined")).toBeInTheDocument();
    await open();
    await userEvent.click(screen.getByRole("checkbox", { name: "Decline reason" }));
    expect(headers()).not.toContain("Decline reason");
    expect(screen.queryByText("card_declined")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reset to default" }));
    expect(headers()).toContain("Decline reason");
    expect(screen.getByRole("checkbox", { name: "Decline reason" })).toBeChecked();
  });

  it("keeps the empty-state cell spanning exactly the visible columns", async () => {
    render(<Harness rows={[]} />);
    const span = () => Number(screen.getByText("No results found").getAttribute("colspan"));
    const all = span();
    await open();
    await userEvent.click(screen.getByRole("checkbox", { name: "Description" }));
    expect(span()).toBe(all - 1);
  });

  it("toggles Wrap cells: aria-checked and whitespace-normal on body cells", async () => {
    render(<Harness />);
    const cell = () => screen.getByText("card_declined").closest("td");
    expect(cell()).not.toHaveClass("whitespace-normal");
    await open();
    const sw = screen.getByRole("switch", { name: "Wrap cells" });
    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(cell()).toHaveClass("whitespace-normal");
    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(cell()).not.toHaveClass("whitespace-normal");
  });

  it("locks Amount as a disabled checked checkbox", async () => {
    render(<Harness />);
    await open();
    const amount = screen.getByRole("checkbox", { name: "Amount" });
    expect(amount).toBeDisabled();
    expect(amount).toBeChecked();
  });

  it("reads saved settings on mount", async () => {
    localStorage.setItem(TABLE_SETTINGS_KEY, JSON.stringify({ hidden: ["status", "amount", "bogus"], wrap: true }));
    render(<Harness />);
    expect(await screen.findByText("card_declined")).toBeInTheDocument();
    expect(headers()).not.toContain("Status");
    expect(headers()).toContain("Amount");
    await open();
    expect(screen.getByRole("switch", { name: "Wrap cells" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: "Status" })).not.toBeChecked();
  });

  it("persists changes and ignores corrupt storage", async () => {
    localStorage.setItem(TABLE_SETTINGS_KEY, "{not json");
    render(<Harness />);
    expect(headers()).toContain("Status");
    await open();
    await userEvent.click(screen.getByRole("checkbox", { name: "Status" }));
    expect(JSON.parse(localStorage.getItem(TABLE_SETTINGS_KEY) ?? "{}")).toEqual({ hidden: ["status"], wrap: false });
  });
});
