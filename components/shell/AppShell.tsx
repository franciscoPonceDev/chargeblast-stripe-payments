"use client";

import clsx from "clsx";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const FOCUSABLE = "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";

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
    const aside = asideRef.current;
    const items = () => Array.from(aside?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    items()[0]?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const target = e.target as Element | null;
        if (e.defaultPrevented || target?.closest?.('[role="dialog"]')) return;
        close();
      } else if (e.key === "Tab") {
        const list = items();
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement;
        if (!aside?.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    const mq = typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 1024px)") : null;
    const onMq = () => {
      if (mq?.matches) setOpen(false);
    };
    mq?.addEventListener("change", onMq);

    return () => {
      document.removeEventListener("keydown", onKey);
      mq?.removeEventListener("change", onMq);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-text-primary focus:shadow-focus"
      >
        Skip to content
      </a>
      <aside
        ref={asideRef}
        id={drawerId}
        aria-label="Sidebar"
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-(--size-sidebar) border-r border-sidebar-border bg-surface transition-[transform,visibility] motion-reduce:transition-none lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:shrink-0 lg:translate-x-0 lg:transition-none lg:visible",
          open ? "translate-x-0" : "invisible -translate-x-full",
        )}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>
      {open && <div data-testid="scrim" aria-hidden="true" onClick={close} className="fixed inset-0 z-30 bg-scrim lg:hidden" />}
      <div className="min-w-0 flex-1">
        <TopBar
          search={search}
          drawerOpen={open}
          drawerId={drawerId}
          onToggleDrawer={() => (open ? close() : setOpen(true))}
          toggleRef={toggleRef}
          inert={open}
        />
        <main id="main" tabIndex={-1} inert={open} className="px-(--space-page-x) pb-(--space-page-bottom) outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
