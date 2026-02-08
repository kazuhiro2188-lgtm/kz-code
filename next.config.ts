import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // パフォーマンス最適化設定
  
  // スクロール復元を無効化（ページ遷移時に自動スクロールしない）
  experimental: {
    scrollRestoration: false,
  },
  
  // 画像最適化設定
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // コンパイラ設定
  compiler: {
    // 本番環境でのconsole.logを削除
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  // 圧縮設定
  compress: true,

  // パワードバイヘッダー設定
  poweredByHeader: false,

  // リダイレクトとリライト設定
  async redirects() {
    return [];
  },

  async rewrites() {
    return [];
  },

  // ヘッダー設定
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
