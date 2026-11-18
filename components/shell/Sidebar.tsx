"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useId, useState } from "react";
import { Icon, type IconName } from "@/components/ui";

const ITEM =
  "flex h-(--size-nav-item) w-full cursor-pointer items-center gap-2 rounded-md px-1.5 text-left text-body text-text-primary hover:bg-bg-hover focus-visible:shadow-focus";
const LABEL = "px-1.5 pb-1 text-caption font-normal text-text-secondary";

const MAIN: { label: string; icon: IconName }[] = [
  { label: "Home", icon: "home" },
  { label: "Balances", icon: "wallet" },
  { label: "Transactions", icon: "transactions" },
  { label: "Customers", icon: "user" },
  { label: "Product catalog", icon: "package" },
];
const SHORTCUTS: { label: string; icon: IconName }[] = [
  { label: "Payments analytics", icon: "rocket" },
  { label: "Reports", icon: "file-text" },
  { label: "Sigma", icon: "sigma" },
  { label: "Radar", icon: "radar" },
];
const PRODUCTS: { label: string; icon: IconName; children: string[] }[] = [
  { label: "Connect", icon: "plug", children: ["Overview", "Connected accounts", "Settings"] },
  { label: "Payments", icon: "credit-card", children: ["Payment links", "Checkout", "Terminal"] },
  { label: "Billing", icon: "receipt", children: ["Subscriptions", "Invoices", "Usage"] },
  { label: "Reporting", icon: "chart", children: ["Reports", "Revenue recognition"] },
  { label: "More", icon: "more", children: ["Identity", "Issuing", "Tax"] },
];

function IconBox({ name }: { name: IconName }) {
  return (
    <span className="flex size-6 items-center justify-center">
      <Icon name={name} size={16} />
    </span>
  );
}

function InertItem({ label, icon }: { label: string; icon: IconName }) {
  return (
    <li>
      <button type="button" className={ITEM}>
        <IconBox name={icon} />
        {label}
      </button>
    </li>
  );
}

function Disclosure({ label, icon, children }: (typeof PRODUCTS)[number]) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <li>
      <button type="button" className={ITEM} aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <IconBox name={icon} />
        <span className="flex-1">{label}</span>
        <Icon name="chevron-down" size={12} className={clsx("text-text-muted transition-transform", open && "rotate-180")} />
      </button>
      <ul id={id} hidden={!open} className="pl-8">
        {open &&
          children.map((c) => (
            <li key={c}>
              <button type="button" className={ITEM}>
                {c}
              </button>
            </li>
          ))}
      </ul>
    </li>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-(--size-topbar) shrink-0 items-center px-(--space-sidebar-x)">
        <button
          type="button"
          className="-mx-1.5 flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-1.5 hover:bg-bg-hover focus-visible:shadow-focus"
        >
          <span
            aria-hidden="true"
            className="flex size-6 items-center justify-center rounded-sm bg-sidebar-avatar-bg text-caption font-semibold text-on-brand"
          >
            A
          </span>
          <span className="flex-1 truncate text-left text-caption font-semibold text-text-primary">Acme Inc.</span>
          <Icon name="chevron-down" size={12} className="text-text-muted" />
        </button>
      </div>
      <nav
        aria-label="Main"
        className="flex flex-1 flex-col gap-(--space-sidebar-gap) overflow-y-auto px-(--space-sidebar-x) pt-1 pb-6"
      >
        <ul>
          {MAIN.map((i) =>
            i.label === "Transactions" ? (
              <li key={i.label}>
                <Link
                  href="/payments"
                  aria-current={pathname === "/payments" ? "page" : "true"}
                  onClick={onNavigate}
                  className={clsx(ITEM, "bg-sidebar-active-bg font-semibold text-brand")}
                >
                  <IconBox name={i.icon} />
                  {i.label}
                </Link>
              </li>
            ) : (
              <InertItem key={i.label} {...i} />
            ),
          )}
        </ul>
        <div role="group" aria-labelledby="nav-shortcuts">
          <p id="nav-shortcuts" className={LABEL}>
            Shortcuts
          </p>
          <ul>
            {SHORTCUTS.map((i) => (
              <InertItem key={i.label} {...i} />
            ))}
          </ul>
        </div>
        <div role="group" aria-labelledby="nav-products">
          <p id="nav-products" className={LABEL}>
            Products
          </p>
          <ul>
            {PRODUCTS.map((p) => (
              <Disclosure key={p.label} {...p} />
            ))}
          </ul>
        </div>
      </nav>
      <div className="shrink-0 px-(--space-sidebar-x) pb-5">
        <button type="button" className={ITEM}>
          <IconBox name="terminal" />
          Developers
        </button>
        <p className="mt-2 px-1.5 text-caption text-text-muted">Demo · Not affiliated with Stripe</p>
      </div>
    </div>
  );
}
