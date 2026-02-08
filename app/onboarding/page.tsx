import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";
import { FadeIn, SlideUp } from "@/components/animations/PageTransition";

export const metadata: Metadata = {
  title: "オンボーディング - KZ-Code",
  description: "学習目標と経験レベルを設定して、パーソナライズされた学習体験を開始しましょう",
};

/**
 * オンボーディングページ
 * 
 * Server Component として実装され、ページのメタデータとレイアウトを提供します。
 * 既にオンボーディングが完了している場合はダッシュボードへリダイレクトします。
 */
export default async function OnboardingPage() {
  // 認証が無効化されている場合は認証チェックをスキップ
  const isAuthDisabled = process.env.DISABLE_AUTH === "true";

  if (!isAuthDisabled) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 未認証ユーザーはログインページへリダイレクト（ミドルウェアでも処理されますが、念のため）
    if (!user) {
      redirect("/login");
    }

    // オンボーディングが既に完了している場合はダッシュボードへリダイレクト
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    // プロフィールが存在し、オンボーディングが完了している場合はダッシュボードへリダイレクト
    if (!profileError && profile && (profile as { onboarding_completed: boolean }).onboarding_completed) {
      redirect("/dashboard");
    }
  }

  // プロフィールが存在しない場合（新規ユーザー）はオンボーディングを表示
  // エラーが発生した場合もオンボーディングを表示（プロフィール作成を促す）

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 px-4 py-12">
      <div className="max-w-3xl w-full space-y-8">
        {/* ヘッダーセクション */}
        <FadeIn>
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                  KZ-Code
                </h1>
              </div>
            </div>
            <h2 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
              ようこそ！
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              あなたに最適な学習体験を提供するために、学習目標と経験レベルを教えてください。
              これにより、パーソナライズされたコンテンツと推奨事項をお届けします。
            </p>
          </div>
        </FadeIn>

        {/* フォームカード */}
        <SlideUp delay={0.2}>
          <div className="relative group">
            {/* グラデーション背景エフェクト */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-20 dark:opacity-10 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* メインカード */}
            <div className="relative bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 backdrop-blur-xl py-10 px-8 md:px-12 shadow-2xl rounded-3xl border border-white/80 dark:border-gray-700/50 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              {/* 装飾的な要素 */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-400/10 to-purple-400/10 rounded-full blur-3xl -z-10" />
              
              <OnboardingForm />
            </div>
          </div>
        </SlideUp>
      </div>
    </div>
  );
}
