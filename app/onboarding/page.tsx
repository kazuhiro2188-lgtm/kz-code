import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-3xl w-full space-y-8">
        {/* ヘッダーセクション */}
        <div className="text-center">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              KZ-Code
            </h1>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              AI駆動開発 基礎理論学習アプリ
            </p>
          </div>
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200">
            ようこそ！
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            あなたに最適な学習体験を提供するために、学習目標と経験レベルを教えてください。
            これにより、パーソナライズされたコンテンツと推奨事項をお届けします。
          </p>
        </div>

        {/* フォームカード */}
        <div className="bg-white dark:bg-gray-800 py-8 px-6 md:px-10 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
