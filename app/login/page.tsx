import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "ログイン - KZ-Code",
  description: "KZ-Code にログインして学習を開始しましょう",
};

/**
 * ログインページ
 * 
 * Server Component として実装され、ページのメタデータとレイアウトを提供します。
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
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
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            ログイン
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            アカウントにログインして学習を開始しましょう
          </p>
        </div>

        {/* フォームカード */}
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <LoginForm />

          {/* リンクセクション */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-3 text-center">
              <Link
                href="/signup"
                className="block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                アカウントをお持ちでない方はこちら
              </Link>
              <Link
                href="/reset-password"
                className="block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                パスワードをお忘れの方はこちら
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
