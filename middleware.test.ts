import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "./middleware";

const forwardedCookie = (res: Response) => res.headers.get("x-middleware-request-cookie");

describe("middleware", () => {
  it("sets a sticky, httpOnly ab_banner cookie when absent", () => {
    const res = middleware(new NextRequest("http://localhost/payments"));
    const c = res.cookies.get("ab_banner");
    expect(["a", "b"]).toContain(c?.value);
    expect(c?.maxAge).toBe(7776000);
    expect(c?.sameSite).toBe("lax");
    expect(c?.path).toBe("/");
    expect(c?.httpOnly).toBe(true);
    expect(forwardedCookie(res)).toBe(`ab_banner=${c?.value}`);
  });
  it("keeps an existing valid cookie", () => {
    const res = middleware(new NextRequest("http://localhost/payments", { headers: { cookie: "ab_banner=b" } }));
    expect(res.cookies.get("ab_banner")).toBeUndefined();
  });
  it("strips an invalid value and forwards only the assigned variant, keeping other cookies", () => {
    const res = middleware(new NextRequest("http://localhost/payments", { headers: { cookie: "x=1; ab_banner=zzz; y=2" } }));
    const v = res.cookies.get("ab_banner")?.value;
    expect(["a", "b"]).toContain(v);
    expect(forwardedCookie(res)).toBe(`x=1; y=2; ab_banner=${v}`);
  });
});
