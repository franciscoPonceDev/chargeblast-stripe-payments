import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import data from "@/data/payments.json";
import { __resetPaymentsCacheForTests } from "@/components/payments/PaymentsView";
import { tabCounts } from "@/lib/payments/query";
import type { Payment } from "@/lib/payments/types";
import PaymentsPage from "./page";

// cookies() needs a request scope; the A/B cookie defaults to variant a.
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));

(globalThis as { jest?: unknown }).jest = { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) };

const ok = () => new Response(JSON.stringify(data), { status: 200, headers: { "content-type": "application/json" } });
const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime, delay: null, pointerEventsCheck: 0 });
const failed = tabCounts(data as Payment[]).failed;
const failedText = `Viewing 1–${Math.min(25, failed)} of ${failed} results`;

describe("PaymentsPage before the dataset arrives", { timeout: 30_000 }, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __resetPaymentsCacheForTests();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("shows the 25 server rows, then applies an interaction made before the fetch resolved", async () => {
    let resolve!: (v: Response) => void;
    const pending = new Promise<Response>((r) => {
      resolve = r;
    });
    vi.stubGlobal("fetch", vi.fn(() => pending));

    render(await PaymentsPage({ searchParams: Promise.resolve({}) }));
    await act(async () => {});
    expect(screen.getByText("Viewing 1–25 of 600 results")).toBeInTheDocument();

    await user().click(screen.getByRole("tab", { name: "Failed" }));

    await act(async () => {
      resolve(ok());
    });
    expect(screen.getByText(failedText)).toBeInTheDocument();
  });

  it("requests the dataset URL with the content version", async () => {
    const fetchMock = vi.fn(async () => ok());
    vi.stubGlobal("fetch", fetchMock);
    render(await PaymentsPage({ searchParams: Promise.resolve({}) }));
    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toMatch(/^\/api\/payments\?v=[0-9a-f]{12}$/);
  });

  it.each([
    ["rejects", () => Promise.reject(new Error("offline"))],
    ["returns 500", () => Promise.resolve(new Response("boom", { status: 500 }))],
  ])("when fetch %s: shows an error, Retry refetches and applies the queued query", async (_name, fail) => {
    const fetchMock = vi.fn().mockImplementationOnce(fail).mockImplementation(async () => ok());
    vi.stubGlobal("fetch", fetchMock);
    render(await PaymentsPage({ searchParams: Promise.resolve({}) }));
    await act(async () => {});

    await user().click(screen.getByRole("tab", { name: "Failed" }));
    expect(screen.getByText(/Couldn.t load all payments\./)).toBeInTheDocument();
    expect(document.querySelector("[aria-busy]")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await user().click(screen.getByRole("button", { name: "Retry" }));
    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/Couldn.t load all payments\./)).not.toBeInTheDocument();
    expect(screen.getByText(failedText)).toBeInTheDocument();
  });

  it("retries automatically with backoff", async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("x")).mockImplementation(async () => ok());
    vi.stubGlobal("fetch", fetchMock);
    render(await PaymentsPage({ searchParams: Promise.resolve({}) }));
    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/Couldn.t load all payments\./)).not.toBeInTheDocument();
  });
});
