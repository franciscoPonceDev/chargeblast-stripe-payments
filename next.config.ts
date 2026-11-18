import type { NextConfig } from "next";
import { allowIndexing } from "./lib/seo";

const nextConfig: NextConfig = {
  // Trade-off: metadata in <head> for every UA (Lighthouse/non-JS crawlers); fine while metadata is static — revisit if it gains I/O.
  htmlLimitedBots: /.*/,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    if (allowIndexing) return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
