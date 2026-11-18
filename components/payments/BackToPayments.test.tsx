import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BackToPayments } from "./BackToPayments";

afterEach(() => sessionStorage.clear());

describe("BackToPayments", () => {
  it("links to /payments by default", () => {
    render(<BackToPayments className="x">Payments</BackToPayments>);
    expect(screen.getByRole("link", { name: "Payments" })).toHaveAttribute("href", "/payments");
  });
  it("links to the last list URL after mount", () => {
    sessionStorage.setItem("payments:lastListUrl", "/payments?status=failed&page=2");
    render(<BackToPayments className="x">Payments</BackToPayments>);
    expect(screen.getByRole("link", { name: "Payments" })).toHaveAttribute("href", "/payments?status=failed&page=2");
  });
});
