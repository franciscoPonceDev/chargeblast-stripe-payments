process.env.TZ = "UTC";
import "@testing-library/jest-dom/vitest";
import React, { createElement, useSyncExternalStore, type ComponentProps } from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  nav.set("");
});

// jsdom lacks ResizeObserver (Radix Checkbox inside a <form> measures its bubble input).
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Tooltip needs the app's single Tooltip.Provider (root layout); give each test-rendered Root one.
vi.mock("@radix-ui/react-tooltip", async (importActual) => {
  const actual = await importActual<typeof import("@radix-ui/react-tooltip")>();
  return {
    ...actual,
    Root: (props: ComponentProps<typeof actual.Root>) =>
      createElement(actual.Provider as React.FC<{ delayDuration: number; children?: React.ReactNode }>, { delayDuration: 300 }, createElement(actual.Root, props)),
  };
});

// Client components call useRouter(); there is no mounted App Router under jsdom.
// Tests assert navigation via `useRouter().push`/`replace`, which return this stable stub.
const router = vi.hoisted(() => ({
  push: vi.fn(), replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn(),
}));
// Controllable useSearchParams: tests call `setMockSearchParams("status=failed")` to simulate navigation.
const nav = vi.hoisted(() => {
  let sp = new URLSearchParams();
  const subs = new Set<() => void>();
  return {
    get: () => sp,
    set: (s: string) => {
      sp = new URLSearchParams(s);
      // The component reads window.location to ignore stale router renders; keep it in step.
      if (typeof window !== "undefined") History.prototype.replaceState.call(window.history, null, "", s ? `/payments?${s}` : "/payments");
      subs.forEach((f) => f());
    },
    subscribe: (f: () => void) => {
      subs.add(f);
      return () => void subs.delete(f);
    },
  };
});
(globalThis as { setMockSearchParams?: (s: string) => void }).setMockSearchParams = nav.set;
vi.mock("next/navigation", async (importActual) => ({
  ...(await importActual<typeof import("next/navigation")>()),
  useRouter: () => router,
  usePathname: () => "/payments",
  useSearchParams: () => useSyncExternalStore(nav.subscribe, nav.get, nav.get),
}));
