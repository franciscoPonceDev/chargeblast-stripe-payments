import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Gtm } from "./Gtm";

afterEach(() => vi.unstubAllEnvs());

type El = ReactElement<{ children: ReactElement<{ id: string; strategy: string; dangerouslySetInnerHTML: { __html: string } }>[] }>;
const scripts = async () => ((await Gtm()) as El).props.children.filter(Boolean).map((c) => c.props);

describe("Gtm", () => {
  it("renders nothing without NEXT_PUBLIC_GTM_ID", async () => {
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "");
    expect(await Gtm()).toBeNull();
  });
  it("puts the consent default before the loader", async () => {
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-TEST123");
    vi.stubEnv("NEXT_PUBLIC_GTM_SERVER_URL", "");
    const [consent, loader] = await scripts();
    expect(consent).toMatchObject({ id: "gtm-consent-default", strategy: "beforeInteractive" });
    expect(loader).toMatchObject({ id: "gtm-loader", strategy: "afterInteractive" });
    expect(consent.dangerouslySetInnerHTML.__html).toContain("analytics_storage:'denied'");
    expect(consent.dangerouslySetInnerHTML.__html).not.toContain("transport_url");
    expect(loader.dangerouslySetInnerHTML.__html).toContain("https://www.googletagmanager.com");
    expect(loader.dangerouslySetInnerHTML.__html).toContain("GTM-TEST123");
  });
  it("uses the server container URL for the loader and transport/server_container_url", async () => {
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-TEST123");
    vi.stubEnv("NEXT_PUBLIC_GTM_SERVER_URL", "https://sgtm.example.com/");
    const [consent, loader] = await scripts();
    expect(consent.dangerouslySetInnerHTML.__html).toContain('transport_url:"https://sgtm.example.com"');
    expect(consent.dangerouslySetInnerHTML.__html).toContain('server_container_url:"https://sgtm.example.com"');
    expect(loader.dangerouslySetInnerHTML.__html).toContain('"https://sgtm.example.com"+');
    expect(loader.dangerouslySetInnerHTML.__html).not.toContain("googletagmanager.com");
  });
});
