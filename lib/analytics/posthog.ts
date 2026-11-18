import { registerAdapter } from "./events";

/** Forwards `track` calls to PostHog. Only imported (dynamically) when NEXT_PUBLIC_POSTHOG_KEY is set. */
export async function initPosthog(key: string): Promise<void> {
  const { default: posthog } = await import("posthog-js");
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: true,
    persistence: "memory", // no cookies or localStorage; not wired to the consent toggle
  });
  registerAdapter((name, params) => posthog.capture(name, params));
}
