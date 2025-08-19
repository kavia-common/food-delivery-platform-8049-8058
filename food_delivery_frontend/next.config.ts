import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    // allow placeholder static usage if later added
    remotePatterns: [],
  },
};

export default nextConfig;
