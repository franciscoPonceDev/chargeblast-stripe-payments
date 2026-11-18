import { beforeEach, describe, expect, it, vi } from "vitest";

const ph = vi.hoisted(() => ({ init: vi.fn(), capture: vi.fn(), opt_in_capturing: vi.fn(), opt_out_capturing: vi.fn() }));
vi.mock("posthog-js", () => ({ default: ph }));

// Fresh module graph per test: the adapter registry and consent listeners are module-level.
async function load() {
  vi.resetModules();
  const consent = await import("./consent");
  const events = await import("./events");
  const { initPosthog } = await import("./posthog");
  return { ...consent, ...events, initPosthog };
}

beforeEach(() => {
  localStorage.clear();
  window.dataLayer = [];
});

describe("posthog adapter", () => {
  it("initialises opted out with no autocapture/pageview/recording/storage", async () => {
    const { initPosthog } = await load();
    await initPosthog("phc_test");
    expect(ph.init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({
        opt_out_capturing_by_default: true,
        autocapture: false,
        capture_pageview: false,
        disable_session_recording: true,
        persistence: "memory",
      }),
    );
  });
  it("captures nothing before consent and captures after opt-in", async () => {
    const { initPosthog, track, setConsent } = await load();
    await initPosthog("phc_test");
    track("export_csv", { row_count: 1 });
    expect(ph.capture).not.toHaveBeenCalled();
    setConsent(true);
    expect(ph.opt_in_capturing).toHaveBeenCalled();
    track("export_csv", { row_count: 2 });
    expect(ph.capture).toHaveBeenCalledWith("export_csv", { row_count: 2 });
    setConsent(false);
    expect(ph.opt_out_capturing).toHaveBeenCalled();
    track("export_csv", { row_count: 3 });
    expect(ph.capture).toHaveBeenCalledTimes(1);
  });
  it("honours a stored grant at load", async () => {
    const { initPosthog, track, CONSENT_KEY } = await load();
    localStorage.setItem(CONSENT_KEY, "granted");
    await initPosthog("phc_test");
    expect(ph.opt_in_capturing).toHaveBeenCalled();
    track("banner_dismissed", {});
    expect(ph.capture).toHaveBeenCalledWith("banner_dismissed", {});
  });
});
