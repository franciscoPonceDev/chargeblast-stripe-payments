import { onConsentChange, readConsent } from "./consent";
import { registerAdapter } from "./events";

/**
 * Forwards `track` calls to PostHog, gated on analytics consent. Only imported (dynamically) when
 * NEXT_PUBLIC_POSTHOG_KEY is set. Nothing is captured until the user opts in.
 */
export async function initPosthog(key: string): Promise<void> {
  const { default: posthog } = await import("posthog-js");
  let granted = false;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    opt_out_capturing_by_default: true,
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
    persistence: "memory",
  });
  const apply = (on: boolean) => {
    granted = on;
    if (on) posthog.opt_in_capturing();
    else posthog.opt_out_capturing();
  };
  apply(readConsent());
  onConsentChange(apply);
  registerAdapter((name, params) => {
    if (granted) posthog.capture(name, params);
  });
}
