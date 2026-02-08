import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopackのworkspace rootを明示的に設定（警告を回避）
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
};

export default nextConfig;
