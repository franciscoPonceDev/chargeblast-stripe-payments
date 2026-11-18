import type { NextConfig } from "next";
import { allowIndexing } from "./lib/seo";
import { securityHeaders } from "./lib/securityHeaders";

const nextConfig: NextConfig = {
  // Trade-off: metadata in <head> for every UA (Lighthouse/non-JS crawlers); fine while metadata is static — revisit if it gains I/O.
  htmlLimitedBots: /.*/,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    const headers = securityHeaders({
      gtmId: process.env.NEXT_PUBLIC_GTM_ID,
      gtmServerUrl: process.env.NEXT_PUBLIC_GTM_SERVER_URL,
      posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      production: process.env.NODE_ENV === "production",
    });
    if (!allowIndexing) headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
