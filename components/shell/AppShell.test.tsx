import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { AppShell } from "./AppShell";

function setup() {
  return render(
    <AppShell search={<input aria-label="Search" />}>
      <h1>Content</h1>
    </AppShell>,
  );
}

describe("AppShell", () => {
  it("marks Transactions as the current page and links to /payments", () => {
    setup();
    const link = screen.getByRole("link", { name: "Transactions" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("href", "/payments");
  });

  it("renders the sections and bottom link in order", () => {
    setup();
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getAllByRole("heading").map((h) => h.textContent)).toEqual(["Shortcuts", "Products"]);
    for (const n of ["Home", "Balances", "Customers", "Product catalog", "Sigma", "Radar", "Developers"]) {
      expect(screen.getByRole("button", { name: n })).toBeInTheDocument();
    }
  });

  it("toggles the Products disclosures", async () => {
    setup();
    const connect = screen.getByRole("button", { name: "Connect" });
    expect(connect).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Connected accounts" })).not.toBeInTheDocument();
    await userEvent.click(connect);
    expect(connect).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Connected accounts" })).toBeInTheDocument();
    await userEvent.click(connect);
    expect(connect).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the account menu with the disclaimer", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByText("demo@acme.test")).toBeInTheDocument();
    expect(screen.getByText("Demo rebuild for a Chargeblast assessment. Not affiliated with Stripe.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("has top bar actions", () => {
    setup();
    for (const n of ["Apps", "Help", "Notifications", "Settings", "Create", "Show me"]) {
      expect(screen.getByRole("button", { name: n })).toBeInTheDocument();
    }
  });

  it("drawer toggle opens, closes on Escape and returns focus", async () => {
    setup();
    const toggle = screen.getByRole("button", { name: "Toggle navigation menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-controls", screen.getByLabelText("Sidebar").id);
    await userEvent.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });
});
