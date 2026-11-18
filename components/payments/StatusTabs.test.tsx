import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { STATUS_PANEL_ID, StatusTabs } from "./StatusTabs";

describe("StatusTabs", () => {
  it("renders six tabs in order with the selected one marked", () => {
    render(<StatusTabs value="refunded" onChange={() => {}} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["All", "Succeeded", "Refunded", "Disputed", "Failed", "Uncaptured"]);
    expect(screen.getByRole("tab", { name: "Refunded" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "false");
  });
  it("points every tab at the shared tabpanel", () => {
    render(<StatusTabs value="all" onChange={() => {}} />);
    for (const t of screen.getAllByRole("tab")) expect(t).toHaveAttribute("aria-controls", STATUS_PANEL_ID);
  });
  it("calls onChange on click", async () => {
    const onChange = vi.fn();
    render(<StatusTabs value="all" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Failed" }));
    expect(onChange).toHaveBeenCalledWith("failed");
  });
  it("moves with arrow keys", async () => {
    const onChange = vi.fn();
    render(<StatusTabs value="all" onChange={onChange} />);
    screen.getByRole("tab", { name: "All" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("succeeded");
  });
});
