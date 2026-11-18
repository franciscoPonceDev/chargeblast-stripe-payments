import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "./middleware";

describe("middleware", () => {
  it("sets a sticky ab_banner cookie when absent", () => {
    const res = middleware(new NextRequest("http://localhost/payments"));
    const c = res.cookies.get("ab_banner");
    expect(["a", "b"]).toContain(c?.value);
    expect(c?.maxAge).toBe(7776000);
    expect(c?.sameSite).toBe("lax");
    expect(c?.path).toBe("/");
  });
  it("keeps an existing valid cookie", () => {
    const res = middleware(new NextRequest("http://localhost/payments", { headers: { cookie: "ab_banner=b" } }));
    expect(res.cookies.get("ab_banner")).toBeUndefined();
  });
  it("replaces an invalid cookie value", () => {
    const res = middleware(new NextRequest("http://localhost/payments", { headers: { cookie: "ab_banner=zzz" } }));
    expect(["a", "b"]).toContain(res.cookies.get("ab_banner")?.value);
  });
});
