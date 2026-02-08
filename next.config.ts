import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLintを無効化せず、ビルド時に警告のみ表示
    ignoreDuringBuilds: false,
    dirs: ['.'],
  },
};

export default nextConfig;
