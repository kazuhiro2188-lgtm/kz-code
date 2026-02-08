import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "パスワードリセット - KZ-Code",
  description: "パスワードリセットメールを送信します",
};

/**
 * パスワードリセットページ
 * 
 * Server Component として実装され、ページのメタデータとレイアウトを提供します。
 */
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">パスワードリセット</h1>
          <p className="mt-2 text-sm text-gray-600">
            登録済みのメールアドレスを入力してください
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <ResetPasswordForm />

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ログインページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
