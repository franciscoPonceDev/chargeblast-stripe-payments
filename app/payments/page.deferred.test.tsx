import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import data from "@/data/payments.json";
import { tabCounts } from "@/lib/payments/query";
import type { Payment } from "@/lib/payments/types";
import PaymentsPage from "./page";

(globalThis as { jest?: unknown }).jest = { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) };

// Separate file: PaymentsView dedupes the /api/payments request at module level, so this
// needs a fresh module registry where the fetch has not been issued yet.
describe("PaymentsPage before the dataset arrives", { timeout: 30_000 }, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("shows the 25 server rows, then applies an interaction made before the fetch resolved", async () => {
    let resolve!: (v: unknown) => void;
    const pending = new Promise((r) => {
      resolve = r;
    });
    vi.stubGlobal("fetch", vi.fn(() => pending));

    render(await PaymentsPage());
    await act(async () => {});
    expect(screen.getByText("Viewing 1–25 of 600 results")).toBeInTheDocument();

    await userEvent
      .setup({ advanceTimers: vi.advanceTimersByTime, delay: null, pointerEventsCheck: 0 })
      .click(screen.getByRole("tab", { name: "Failed" }));

    await act(async () => {
      resolve({ ok: true, status: 200, json: async () => data });
    });
    const failed = tabCounts(data as Payment[]).failed;
    expect(screen.getByText(`Viewing 1–${Math.min(25, failed)} of ${failed} results`)).toBeInTheDocument();
  });
});
