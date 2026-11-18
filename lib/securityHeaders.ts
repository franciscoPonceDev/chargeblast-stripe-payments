export interface SecurityEnv {
  gtmId?: string;
  gtmServerUrl?: string;
  posthogKey?: string;
  posthogHost?: string;
  production: boolean;
}

function origin(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const isLocal = u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1");
    if (u.protocol !== "https:" && !isLocal) return null;
    // Reject anything that could terminate the source expression and start a new CSP directive.
    return /[;,\s"'\\]/.test(u.origin) ? null : u.origin;
  } catch {
    return null;
  }
}

const POSTHOG_DEFAULT_HOST = "https://us.i.posthog.com";

/** PostHog serves its loader and remote config from a sibling `-assets` host (us.i.posthog.com -> us-assets.i.posthog.com). */
function posthogAssets(host: string): string | null {
  const m = /^https:\/\/([a-z]+)\.i\.posthog\.com$/.exec(host);
  return m ? `https://${m[1]}-assets.i.posthog.com` : null;
}

export function buildCsp(env: SecurityEnv): string {
  const script = ["'self'", "'unsafe-inline'"];
  const connect = ["'self'"];
  const img = ["'self'", "data:"];

  // Trade-off: 'unsafe-inline' for scripts. Next's inline bootstrap/flight scripts differ per request and /payments/[id] is
  // prerendered, so a per-request nonce (or build-time hashes) cannot cover every route; every other directive stays strict.
  if (!env.production) script.push("'unsafe-eval'"); // React dev tooling only

  if (env.gtmId) {
    script.push("https://www.googletagmanager.com");
    connect.push("https://www.googletagmanager.com", "https://www.google-analytics.com", "https://*.google-analytics.com", "https://*.analytics.google.com");
    img.push("https://www.googletagmanager.com", "https://www.google-analytics.com", "https://*.google-analytics.com");
    const server = origin(env.gtmServerUrl);
    if (server) {
      script.push(server);
      connect.push(server);
      img.push(server);
    }
  }

  if (env.posthogKey) {
    const host = origin(env.posthogHost) ?? POSTHOG_DEFAULT_HOST;
    connect.push(host);
    const assets = posthogAssets(host);
    if (assets) {
      script.push(assets);
      connect.push(assets);
    }
  }

  return [
    "default-src 'self'",
    `script-src ${script.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${img.join(" ")}`,
    "font-src 'self'",
    `connect-src ${connect.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export function securityHeaders(env: SecurityEnv): { key: string; value: string }[] {
  const headers = [
    { key: "Content-Security-Policy", value: buildCsp(env) },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ];
  if (env.production) headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" });
  return headers;
}
