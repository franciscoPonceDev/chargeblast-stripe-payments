"use client";

import clsx from "clsx";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ search, children }: { search: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    asideRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside
        ref={asideRef}
        id={drawerId}
        aria-label="Sidebar"
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-(--size-sidebar) border-r border-sidebar-border bg-surface transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:shrink-0 lg:translate-x-0 lg:transition-none lg:visible",
          open ? "translate-x-0" : "invisible -translate-x-full",
        )}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>
      {open && <div aria-hidden="true" onClick={close} className="fixed inset-0 z-30 bg-scrim lg:hidden" />}
      <div className="min-w-0 flex-1">
        <TopBar
          search={search}
          drawerOpen={open}
          drawerId={drawerId}
          onToggleDrawer={() => (open ? close() : setOpen(true))}
          toggleRef={toggleRef}
        />
        <main className="px-(--space-page-x) pb-(--space-page-bottom)">{children}</main>
      </div>
    </div>
  );
}
