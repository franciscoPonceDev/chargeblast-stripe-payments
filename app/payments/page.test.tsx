import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PaymentsPage from "./page";

describe("PaymentsPage", () => {
  it("renders the Transactions heading", () => {
    render(<PaymentsPage />);
    expect(screen.getByRole("heading", { name: "Transactions" })).toBeInTheDocument();
  });
});
