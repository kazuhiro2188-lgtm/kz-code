import type { Metadata } from "next";
import Link from "next/link";
import SignUpForm from "./SignUpForm";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">アカウント作成</h1>
          <p className="mt-2 text-sm text-gray-900">
            KZ-Code のアカウントを作成して学習を開始しましょう
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <SignUpForm />

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              既にアカウントをお持ちの方はこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
