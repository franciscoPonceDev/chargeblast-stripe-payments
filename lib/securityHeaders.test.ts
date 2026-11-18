import { describe, expect, it } from "vitest";
import { buildCsp, securityHeaders } from "./securityHeaders";

const prod = { production: true };

describe("buildCsp", () => {
  it("is first-party only by default", () => {
    const csp = buildCsp(prod);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline';");
    expect(csp).toContain("connect-src 'self';");
    expect(csp).toContain("img-src 'self' data:;");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).not.toMatch(/googletagmanager|posthog|unsafe-eval/);
  });

  it("allows unsafe-eval only outside production", () => {
    expect(buildCsp({ production: false })).toContain("'unsafe-eval'");
  });

  it("adds GTM and the server container origin only when configured", () => {
    const csp = buildCsp({ ...prod, gtmId: "GTM-TEST", gtmServerUrl: "https://sgtm.example.com/path" });
    expect(csp).toContain("script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://sgtm.example.com;");
    expect(csp).toMatch(/connect-src [^;]*https:\/\/sgtm\.example\.com/);
    expect(buildCsp({ ...prod, gtmServerUrl: "https://sgtm.example.com" })).not.toContain("sgtm");
  });

  it("adds the PostHog host and its assets host only when a key is set", () => {
    expect(buildCsp({ ...prod, posthogHost: "https://eu.i.posthog.com" })).not.toContain("posthog");
    const csp = buildCsp({ ...prod, posthogKey: "phc_x" });
    expect(csp).toMatch(/connect-src [^;]*https:\/\/us\.i\.posthog\.com/);
    expect(csp).toMatch(/script-src [^;]*https:\/\/us-assets\.i\.posthog\.com/);
    expect(buildCsp({ ...prod, posthogKey: "phc_x", posthogHost: "https://eu.i.posthog.com" })).toContain("https://eu-assets.i.posthog.com");
  });
});

describe("securityHeaders", () => {
  it("sends HSTS only in production", () => {
    expect(securityHeaders(prod).map((h) => h.key)).toContain("Strict-Transport-Security");
    expect(securityHeaders({ production: false }).map((h) => h.key)).not.toContain("Strict-Transport-Security");
  });
  it("includes the standard hardening headers", () => {
    const map = Object.fromEntries(securityHeaders(prod).map((h) => [h.key, h.value]));
    expect(map["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(map["X-Content-Type-Options"]).toBe("nosniff");
    expect(map["Permissions-Policy"]).toBe("camera=(), microphone=(), geolocation=()");
  });
});
