"use client";

import { useState, useTransition } from "react";
import { resetPasswordAction } from "./actions";

/**
 * パスワードリセットフォームコンポーネント
 * 
 * Client Component として実装され、フォーム状態管理と Server Action の呼び出しを担当します。
 */
export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await resetPasswordAction(email);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          <p className="font-medium">メールを送信しました</p>
          <p className="mt-2 text-sm">
            {email} にパスワードリセットリンクを送信しました。
            メールボックスを確認して、リンクをクリックしてください。
          </p>
        </div>
        <a
          href="/login"
          className="block text-center text-sm text-blue-600 hover:text-blue-800"
        >
          ログインページに戻る
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isPending}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          placeholder="example@email.com"
        />
        <p className="mt-1 text-xs text-gray-500">
          登録済みのメールアドレスを入力してください
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "送信中..." : "パスワードリセットメールを送信"}
      </button>
    </form>
  );
}
