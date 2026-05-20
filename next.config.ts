import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.1.35", "localhost", "0.0.0.0"],
};

export default nextConfig;
