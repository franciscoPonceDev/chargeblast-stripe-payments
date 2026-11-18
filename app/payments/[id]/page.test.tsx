import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import data from "@/data/payments.json";
import { formatAmount } from "@/lib/format";
import type { Payment } from "@/lib/payments/types";
import PaymentPage, { generateMetadata, generateStaticParams } from "./page";

const all = data as Payment[];
const succeeded = all.find((p) => p.status === "succeeded" && !p.disputed)!;
const failed = all.find((p) => p.status === "failed")!;
const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe("PaymentPage", { timeout: 30_000 }, () => {
  it("renders amount, status badge and timeline for a succeeded payment", async () => {
    render(await PaymentPage(params(succeeded.id)));
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(formatAmount(succeeded.amount, succeeded.currency));
    expect(screen.getAllByText("Succeeded").length).toBeGreaterThan(0);
    expect(within(h1).queryByText("Succeeded")).not.toBeInTheDocument();
    expect(screen.getByText("Payment started")).toBeInTheDocument();
    expect(screen.getByText("Payment succeeded")).toBeInTheDocument();
    expect(screen.getByText("Statement descriptor")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Payments" }).some((l) => l.getAttribute("href") === "/payments")).toBe(true);
  });

  it("shows the decline reason for a failed payment", async () => {
    render(await PaymentPage(params(failed.id)));
    expect(screen.getByText("Payment failed")).toBeInTheDocument();
    expect(screen.getAllByText(failed.declineReason!).length).toBeGreaterThan(0);
  });

  it("calls notFound for an unknown id", async () => {
    await expect(PaymentPage(params("pi_nope"))).rejects.toThrow(/NEXT_(HTTP_ERROR_FALLBACK;404|NOT_FOUND)/);
  });

  it("generates a param per payment and a short-id title", async () => {
    expect(generateStaticParams()).toHaveLength(600);
    const m = await generateMetadata(params(succeeded.id));
    expect(m.title).toMatch(/^Payment pi_/);
  });
});

describe("details search", () => {
  it("Enter navigates to the list with the query", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const { useRouter } = await import("next/navigation");
    render(await PaymentPage(params(succeeded.id)));
    await userEvent.type(screen.getAllByLabelText("Search")[0], "jane doe{Enter}");
    expect(useRouter().push).toHaveBeenCalledWith("/payments?q=jane+doe");
  });
});
