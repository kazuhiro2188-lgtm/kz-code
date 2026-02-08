import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { NetworkStatus } from "@/components/ui/NetworkStatus";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: {
    default: "KZ-Code - AI駆動開発 基礎理論学習アプリ",
    template: "%s | KZ-Code",
  },
  description: "AI駆動開発における基礎理論・設計原理を学ぶ学習アプリ。プロンプトエンジニアリング、AIアーキテクチャ設計、AIツール統合など、実践的なスキルを習得できます。",
  keywords: ["AI駆動開発", "プロンプトエンジニアリング", "AIアーキテクチャ", "学習アプリ", "エンジニア教育"],
  authors: [{ name: "KZ-Code Team" }],
  creator: "KZ-Code",
  publisher: "KZ-Code",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    siteName: "KZ-Code",
    title: "KZ-Code - AI駆動開発 基礎理論学習アプリ",
    description: "AI駆動開発における基礎理論・設計原理を学ぶ学習アプリ",
  },
  twitter: {
    card: "summary_large_image",
    title: "KZ-Code - AI駆動開発 基礎理論学習アプリ",
    description: "AI駆動開発における基礎理論・設計原理を学ぶ学習アプリ",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning className={notoSansJP.variable}>
      <head>
        {/* 構造化データ: WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "KZ-Code",
              description: "AI駆動開発における基礎理論・設計原理を学ぶ学習アプリ",
              url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/search?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body>
        {/* スキップリンク */}
        <a
          href="#main-content"
          className="skip-link"
          aria-label="メインコンテンツにスキップ"
        >
          メインコンテンツにスキップ
        </a>
        <ThemeProvider>
          <NetworkStatus />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
