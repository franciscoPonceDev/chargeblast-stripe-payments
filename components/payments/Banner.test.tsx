import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { __resetExposureForTests } from "@/lib/analytics/exposure";
import { Banner } from "./Banner";

beforeEach(() => {
  window.dataLayer = [];
  sessionStorage.clear();
  __resetExposureForTests();
});

describe("Banner experiment", () => {
  it("shows variant copy, fires exposure once and tracks the CTA", async () => {
    const { rerender } = render(<Banner variant="b" />);
    rerender(<Banner variant="b" />);
    await userEvent.click(screen.getByRole("button", { name: "Explore Sigma" }));
    expect(window.dataLayer).toEqual([
      { event: "experiment_viewed", experiment: "banner_cta", variant: "b" },
      { event: "banner_cta_clicked", variant: "b" },
    ]);
  });
  it("defaults to variant a and tracks dismiss", async () => {
    render(<Banner />);
    expect(screen.getByRole("button", { name: "Get started" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(window.dataLayer?.at(-1)).toEqual({ event: "banner_dismissed" });
  });
});
