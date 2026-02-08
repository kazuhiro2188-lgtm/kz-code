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
  title: "KZ-Code - AI駆動開発 基礎理論学習アプリ",
  description: "AI駆動開発における基礎理論・設計原理を学ぶ学習アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning className={notoSansJP.variable}>
      <body>
        <ThemeProvider>
          <NetworkStatus />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
