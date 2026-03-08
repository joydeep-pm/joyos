import type { NextConfig } from "next";
import path from "node:path";

const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  ...(isVercel ? {} : { outputFileTracingRoot: path.join(__dirname, "..", "..") })
};

export default nextConfig;
