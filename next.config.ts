import type { NextConfig } from "next";
import { allowIndexing } from "./lib/seo";

const nextConfig: NextConfig = {
  // Trade-off: block on generateMetadata for every client so title/description land in <head> (the dynamic /payments route otherwise streams them into <body>).
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
