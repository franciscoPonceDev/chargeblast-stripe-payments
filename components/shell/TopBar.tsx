"use client";

import { useState, type ReactNode, type Ref } from "react";
import { Icon, Popover, type IconName } from "@/components/ui";

const ICON_BTN =
  "flex size-(--size-topbar-btn) cursor-pointer items-center justify-center rounded-full text-text-primary hover:bg-bg-hover focus-visible:shadow-focus";

const ACTIONS: { label: string; icon: IconName }[] = [
  { label: "Apps", icon: "grid" },
  { label: "Help", icon: "help" },
  { label: "Notifications", icon: "bell" },
  { label: "Settings", icon: "gear" },
];

const MENU_ITEM =
  "flex h-8 w-full cursor-pointer items-center rounded-md px-2 text-left text-body text-text-primary hover:bg-bg-hover focus-visible:shadow-focus";

export interface TopBarProps {
  search: ReactNode;
  drawerOpen: boolean;
  drawerId: string;
  onToggleDrawer: () => void;
  toggleRef: Ref<HTMLButtonElement>;
  inert?: boolean;
}

export function TopBar({ search, drawerOpen, drawerId, onToggleDrawer, toggleRef, inert }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="flex h-(--size-topbar) items-center gap-3 px-(--space-page-x)">
      <button
        ref={toggleRef}
        type="button"
        aria-label="Toggle navigation menu"
        aria-controls={drawerId}
        aria-expanded={drawerOpen}
        onClick={onToggleDrawer}
        className={`${ICON_BTN} lg:hidden`}
      >
        <Icon name="menu" size={16} />
      </button>
      <div inert={inert} className="min-w-0 flex-1 basis-0 lg:max-w-(--size-search-max)">{search}</div>
      <div inert={inert} className="ml-auto flex shrink-0 items-center gap-2">
        <p className="hidden text-caption text-text-secondary xl:block">
          Test mode has moved.{" "}
          <button type="button" className="cursor-pointer underline hover:text-text-primary focus-visible:shadow-focus">
            Show me
          </button>
        </p>
        <div className="hidden items-center gap-1 sm:flex">
          {ACTIONS.map((a) => (
            <button key={a.label} type="button" aria-label={a.label} className={ICON_BTN}>
              <Icon name={a.icon} size={16} />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Create"
          className="flex size-(--size-create-btn) cursor-pointer items-center justify-center rounded-full bg-brand text-on-brand hover:bg-brand-hover focus-visible:shadow-focus"
        >
          <Icon name="plus" size={14} />
        </button>
        <Popover
          open={menuOpen}
          onOpenChange={setMenuOpen}
          align="end"
          aria-label="Account menu"
          className="w-64 p-2"
          trigger={
            <button
              type="button"
              aria-label="Account menu"
              aria-haspopup="dialog"
              className="flex size-(--size-topbar-btn) cursor-pointer items-center justify-center rounded-full bg-sidebar-avatar-bg text-caption font-semibold text-on-brand focus-visible:shadow-focus"
            >
              A
            </button>
          }
        >
          <div className="px-2 py-1">
            <p className="font-semibold text-text-primary">Acme Inc.</p>
            <p className="text-caption text-text-secondary">demo@acme.test</p>
          </div>
          <div className="sm:hidden">
            <hr className="my-2 border-border-row" />
            {["Apps", "Help", "Notifications"].map((l) => (
              <button key={l} type="button" className={MENU_ITEM}>
                {l}
              </button>
            ))}
          </div>
          <hr className="my-2 border-border-row" />
          {["Profile", "Settings", "Sign out"].map((l) => (
            <button key={l} type="button" className={MENU_ITEM}>
              {l}
            </button>
          ))}
          <hr className="my-2 border-border-row" />
          <p className="px-2 pb-1 text-caption text-text-muted">
            Demo rebuild for a Chargeblast assessment. Not affiliated with Stripe.
          </p>
        </Popover>
      </div>
    </header>
  );
}
