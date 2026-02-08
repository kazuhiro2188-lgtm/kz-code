import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import SignUpForm from "./SignUpForm";

// アニメーションラッパーを動的インポート
const FadeInWrapper = dynamic(
  () => import("@/components/dashboard/DashboardWrapper").then((mod) => mod.FadeInWrapper)
);

const SlideUpWrapper = dynamic(
  () => import("@/components/dashboard/DashboardWrapper").then((mod) => mod.SlideUpWrapper)
);

export const metadata: Metadata = {
  title: "サインアップ - KZ-Code",
  description: "KZ-Code のアカウントを作成して学習を開始しましょう",
};

/**
 * サインアップページ
 * 
 * Server Component として実装され、ページのメタデータとレイアウトを提供します。
 */
export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* ヘッダーセクション */}
        <FadeInWrapper>
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-12-4a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                  KZ-Code
                </h1>
              </div>
              <h2 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                アカウント作成
              </h2>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
                KZ-Code のアカウントを作成して学習を開始しましょう
              </p>
            </div>
          </div>
        </FadeInWrapper>

        {/* フォームカード */}
        <SlideUpWrapper delay={0.2}>
          <div className="relative group">
            {/* グラデーション背景エフェクト */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-20 dark:opacity-10 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* メインカード */}
            <div className="relative bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 backdrop-blur-xl py-10 px-8 shadow-2xl rounded-3xl border border-white/80 dark:border-gray-700/50 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              {/* 装飾的な要素 */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-400/10 to-purple-400/10 rounded-full blur-3xl -z-10" />
              
              <SignUpForm />

              {/* リンクセクション */}
              <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 text-center">
                <Link
                  href="/login"
                  className="group/link inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-all duration-300 hover:scale-105"
                >
                  <span>既にアカウントをお持ちの方はこちら</span>
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </SlideUpWrapper>
      </div>
    </div>
  );
}
