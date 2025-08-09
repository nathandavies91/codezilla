import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  allowedDevOrigins: [
    "http://localhost:3000",
    "https://172.29.32.1",
  ],
};

export default nextConfig;
