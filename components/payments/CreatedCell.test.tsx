import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CreatedCell } from "./CreatedCell";

const NOW = Date.UTC(2026, 10, 17, 18, 0, 0);

describe("CreatedCell", () => {
  it("is a single keyboard tab stop that reveals the relative time on focus", async () => {
    render(<CreatedCell created={NOW - 3_600_000} now={NOW} />);
    await userEvent.tab();
    const trigger = document.activeElement as HTMLElement;
    expect(trigger).toHaveAttribute("tabindex", "0");
    expect((await screen.findAllByText(/hour ago|1 hour/i)).length).toBeGreaterThan(0);
    expect(trigger).toHaveAttribute("aria-describedby");
  });
});
