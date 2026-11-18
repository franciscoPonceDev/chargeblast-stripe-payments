import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows a second dev server (e.g. for screenshots) to use its own build dir.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
