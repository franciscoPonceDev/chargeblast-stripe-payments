import { describe, it, expect, vi, afterEach } from "vitest";
import { useState } from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_QUERY, type PaymentsQuery } from "@/lib/payments/query";
import { FilterBar } from "./FilterBar";
import { SearchInput } from "./SearchInput";

function setup(over: Partial<PaymentsQuery> = {}) {
  const onChange = vi.fn();
  render(<FilterBar query={{ ...DEFAULT_QUERY, ...over }} onChange={onChange} />);
  return onChange;
}

describe("FilterBar", () => {
  it("renders pills in Stripe order", () => {
    setup();
    const names = screen.getAllByRole("button").map((b) => b.textContent);
    expect(names).toEqual(["Date and time", "Amount", "Currency", "Status", "Payment method", "More filters"]);
  });

  it("status: apply emits only statuses, in Stripe order", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByRole("button", { name: "Status" }));
    expect(screen.getByText("Filter by status")).toBeInTheDocument();
    const labels = screen.getAllByRole("checkbox").map((c) => c.getAttribute("aria-label"));
    expect(labels).toEqual(["Succeeded", "Pending", "Failed", "Refunded", "Canceled", "Blocked"]);
    await userEvent.click(screen.getByRole("checkbox", { name: "Failed" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Succeeded" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledWith({ statuses: ["succeeded", "failed"] });
    expect(screen.queryByText("Filter by status")).not.toBeInTheDocument();
  });

  it("closing without Apply discards the draft", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByRole("button", { name: "Status" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Failed" }));
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Status" }));
    expect(screen.getByRole("checkbox", { name: "Failed" })).toHaveAttribute("aria-checked", "false");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("set pill shows summary and the x clears without opening", async () => {
    const onChange = setup({ statuses: ["succeeded", "failed", "pending"] });
    expect(screen.getByText("Succeeded, Failed +1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear Status filter" }));
    expect(onChange).toHaveBeenCalledWith({ statuses: [] });
    expect(screen.queryByText("Filter by status")).not.toBeInTheDocument();
  });

  it("date: preset 7d", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByRole("button", { name: "Date and time" }));
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "Last 7 days" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledWith({ date: { preset: "7d" } });
  });

  it("date: custom from/to and summary", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByRole("button", { name: "Date and time" }));
    await userEvent.click(screen.getByRole("radio", { name: "Custom" }));
    await userEvent.type(screen.getByLabelText("From"), "2026-11-01");
    await userEvent.type(screen.getByLabelText("To"), "2026-11-10");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledWith({ date: { preset: "custom", from: "2026-11-01", to: "2026-11-10" } });
  });

  it("date: custom summary uses en dash", () => {
    setup({ date: { preset: "custom", from: "2026-11-01", to: "2026-11-10" } });
    expect(screen.getByText("Nov 1 – Nov 10")).toBeInTheDocument();
  });

  it("amount: between 10 and 20; Apply disabled when empty", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByRole("button", { name: "Amount" }));
    const apply = screen.getByRole("button", { name: "Apply" });
    expect(apply).toBeDisabled();
    await userEvent.selectOptions(screen.getByRole("combobox"), "is between");
    await userEvent.type(screen.getByLabelText("Minimum"), "10");
    expect(apply).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Maximum"), "20");
    expect(apply).toBeEnabled();
    await userEvent.click(apply);
    expect(onChange).toHaveBeenCalledWith({ amount: { op: "between", min: 10, max: 20 } });
  });

  it("amount: single value and summary", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByRole("button", { name: "Amount" }));
    await userEvent.selectOptions(screen.getByRole("combobox"), "is greater than");
    await userEvent.type(screen.getByLabelText("Amount"), "100");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledWith({ amount: { op: "gt", value: 100 } });
  });

  it("amount summary text", () => {
    setup({ amount: { op: "eq", value: 9.88 } });
    expect(screen.getByText("is equal to 9.88")).toBeInTheDocument();
  });

  it("method and currency", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByRole("button", { name: "Payment method" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Wallet" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenLastCalledWith({ methods: ["wallet"] });
    await userEvent.click(screen.getByRole("button", { name: "Currency" }));
    expect(screen.getAllByRole("checkbox").map((c) => c.getAttribute("aria-label"))).toEqual([
      "USD", "GBP", "EUR", "BRL", "CAD", "JPY",
    ]);
    await userEvent.click(screen.getByRole("checkbox", { name: "GBP" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenLastCalledWith({ currencies: ["gbp"] });
  });

  it("more filters: search commits and clears", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByRole("button", { name: "More filters" }));
    const pop = screen.getByRole("dialog");
    await userEvent.type(within(pop).getByLabelText("Search"), "pi_123");
    await userEvent.click(within(pop).getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledWith({ search: "pi_123" });
  });

  it("more filters popover is titled Search payments and labelled by it", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "More filters" }));
    expect(screen.getByRole("heading", { level: 2, name: "Search payments" })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Search payments" })).toBeInTheDocument();
  });

  it("keeps focus on the pill trigger after Apply and after Clear", async () => {
    function Harness() {
      const [q, setQ] = useState<PaymentsQuery>(DEFAULT_QUERY);
      return <FilterBar query={q} onChange={(p) => setQ((c) => ({ ...c, ...p }))} />;
    }
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Status" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Failed" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    const trigger = screen.getByRole("button", { name: /^Status/ });
    expect(trigger).toHaveTextContent("Failed");
    expect(document.activeElement).toBe(trigger);
    // reopening shows the committed value
    await userEvent.click(trigger);
    expect(screen.getByRole("checkbox", { name: "Failed" })).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Clear Status filter" }));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Status" }));
  });

  it("amount rejects negatives and normalises between", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByRole("button", { name: "Amount" }));
    await userEvent.type(screen.getByLabelText("Amount"), "-5");
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    await userEvent.clear(screen.getByLabelText("Amount"));
    await userEvent.selectOptions(screen.getByRole("combobox"), "is between");
    await userEvent.type(screen.getByLabelText("Minimum"), "20");
    await userEvent.type(screen.getByLabelText("Maximum"), "10");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledWith({ amount: { op: "between", min: 10, max: 20 } });
  });

  it("custom date swaps from > to, and needs at least one side", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByRole("button", { name: "Date and time" }));
    await userEvent.click(screen.getByRole("radio", { name: "Custom" }));
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    await userEvent.type(screen.getByLabelText("From"), "2026-11-10");
    await userEvent.type(screen.getByLabelText("To"), "2026-11-01");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledWith({ date: { preset: "custom", from: "2026-11-01", to: "2026-11-10" } });
  });

  it("Enter submits the form", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByRole("button", { name: "Amount" }));
    await userEvent.type(screen.getByLabelText("Amount"), "5{Enter}");
    expect(onChange).toHaveBeenCalledWith({ amount: { op: "eq", value: 5 } });
  });

  it.each([
    [{ preset: "today" }, "Today"],
    [{ preset: "7d" }, "Last 7 days"],
    [{ preset: "30d" }, "Last 30 days"],
  ] as const)("date summary %o", (date, text) => {
    setup({ date: date as PaymentsQuery["date"] });
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("more filters set state", async () => {
    const onChange = setup({ search: "bob" });
    expect(screen.getByText("bob")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear More filters filter" }));
    expect(onChange).toHaveBeenCalledWith({ search: "" });
  });
});

describe("SearchInput", () => {
  afterEach(() => vi.useRealTimers());

  it("debounces onChange by 200ms", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.type(screen.getByPlaceholderText("Search"), "abc");
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("abc");
  });

  it("external change cancels a pending debounce", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onChange = vi.fn();
    const { rerender } = render(<SearchInput value="" onChange={onChange} />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.type(screen.getByPlaceholderText("Search"), "x");
    rerender(<SearchInput value="reset" onChange={onChange} />);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Search")).toHaveValue("reset");
  });

  it("syncs when value changes externally and clears timer on unmount", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onChange = vi.fn();
    const { rerender, unmount } = render(<SearchInput value="" onChange={onChange} />);
    rerender(<SearchInput value="zed" onChange={onChange} />);
    expect(screen.getByPlaceholderText("Search")).toHaveValue("zed");
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.type(screen.getByPlaceholderText("Search"), "x");
    unmount();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
