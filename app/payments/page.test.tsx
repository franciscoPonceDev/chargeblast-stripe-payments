import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import data from "@/data/payments.json";
import { tabCounts } from "@/lib/payments/query";
import type { Payment } from "@/lib/payments/types";
import { __resetPaymentsCacheForTests } from "@/components/payments/PaymentsView";
import PaymentsPage from "./page";

// RTL's asyncWrapper only flushes fake timers when it detects Jest. Under Vitest it
// awaits a real-looking setTimeout(0) that never fires with fake timers, so every
// awaited user event hangs. Expose the one Jest API it calls.
(globalThis as { jest?: unknown }).jest = { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) };

// Each test mounts the whole shell plus a 25-row table from 600 mock rows in jsdom;
// that costs 1-5s per test even on an idle machine, i.e. right at Vitest's 5s default,
// so CPU contention in full-suite runs tipped it over. Budget it explicitly.
describe("PaymentsPage", { timeout: 30_000 }, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __resetPaymentsCacheForTests();
    // The island fetches the full dataset from the static /api/payments route after hydration.
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(data), { status: 200, headers: { "content-type": "application/json" } })),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
  // Render the async Server Component's output, then let the stubbed fetch resolve.
  const renderPage = async () => {
    render(await PaymentsPage());
    await act(async () => {});
  };
  // Fully fake timers; delay:null removes userEvent's internal setTimeout waits and
// pointerEventsCheck:0 skips per-click getComputedStyle walks over the 25-row table
// (the slow part under CPU contention).
const user = () =>
    userEvent.setup({ advanceTimers: vi.advanceTimersByTime, delay: null, pointerEventsCheck: 0 });

  it("renders the Transactions heading and section tabs", async () => {
    await renderPage();
    expect(screen.getByRole("heading", { name: "Transactions" })).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "Transactions sections" })).getByRole("button", { name: "Payments" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Create payment" })).toBeInTheDocument();
  });
  it("shows footer and paginates", async () => {
    await renderPage();
    expect(screen.getByText("Viewing 1–25 of 600 results")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await user().click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Viewing 26–50 of 600 results")).toBeInTheDocument();
  });
  it("changes page size", async () => {
    await renderPage();
    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "100" } });
    expect(screen.getByText("Viewing 1–100 of 600 results")).toBeInTheDocument();
  });
  it("narrows by Failed tab", async () => {
    await renderPage();
    await user().click(screen.getByRole("tab", { name: "Failed" }));
    expect(screen.queryByText("Viewing 1–25 of 600 results")).not.toBeInTheDocument();
    expect(screen.getByText(/^Viewing 1–\d+ of \d+ results$/)).toBeInTheDocument();
  });
  it("shows empty state for no matches", async () => {
    await renderPage();
    await user().type(screen.getAllByLabelText("Search")[0], "zzzznomatch");
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByText("Viewing 0 results")).toBeInTheDocument();
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });
  it("dismisses the banner", async () => {
    await renderPage();
    await user().click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText(/Rule Attributes/)).not.toBeInTheDocument();
  });
  it("page size change from page 2 resets to page 1", async () => {
    await renderPage();
    await user().click(screen.getByRole("button", { name: "Next" }));
    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "50" } });
    expect(screen.getByText("Viewing 1–50 of 600 results")).toBeInTheDocument();
  });
  it("tab change from page 2 resets to page 1 with exact count", async () => {
    await renderPage();
    const failed = tabCounts(data as Payment[]).failed;
    await user().click(screen.getByRole("button", { name: "Next" }));
    await user().click(screen.getByRole("tab", { name: "Failed" }));
    const end = Math.min(25, failed);
    expect(screen.getByText(`Viewing 1–${end} of ${failed} results`)).toBeInTheDocument();
  });
  it("top-bar search resets to page 1", async () => {
    await renderPage();
    await user().click(screen.getByRole("button", { name: "Next" }));
    await user().type(screen.getAllByLabelText("Search")[0], "a");
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByText(/^Viewing 1–\d+ of \d+ results$/)).toBeInTheDocument();
  });
  it("moves focus to the selected status tab after dismissing the banner", async () => {
    await renderPage();
    await user().click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.getByRole("tab", { name: "All" })).toHaveFocus();
  });
});
