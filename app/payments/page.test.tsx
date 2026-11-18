import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import PaymentsPage from "./page";

describe("PaymentsPage", () => {
  it("renders the Transactions heading and section tabs", () => {
    render(<PaymentsPage />);
    expect(screen.getByRole("heading", { name: "Transactions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Payments" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Create payment" })).toBeInTheDocument();
  });
  it("shows footer and paginates", async () => {
    render(<PaymentsPage />);
    expect(screen.getByText("Viewing 1–25 of 600 results")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Viewing 26–50 of 600 results")).toBeInTheDocument();
  });
  it("changes page size", () => {
    render(<PaymentsPage />);
    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "100" } });
    expect(screen.getByText("Viewing 1–100 of 600 results")).toBeInTheDocument();
  });
  it("narrows by Failed tab", async () => {
    render(<PaymentsPage />);
    await userEvent.click(screen.getByRole("tab", { name: "Failed" }));
    expect(screen.queryByText("Viewing 1–25 of 600 results")).not.toBeInTheDocument();
    expect(screen.getByText(/^Viewing 1–\d+ of \d+ results$/)).toBeInTheDocument();
  });
  it("shows empty state for no matches", async () => {
    render(<PaymentsPage />);
    await userEvent.type(screen.getAllByLabelText("Search")[0], "zzzznomatch");
    expect(await screen.findByText("Viewing 0 results", {}, { timeout: 1500 })).toBeInTheDocument();
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });
  it("dismisses the banner", async () => {
    render(<PaymentsPage />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText(/Rule Attributes/)).not.toBeInTheDocument();
  });
});
