"use client";

import { useState, useTransition } from "react";
import { signInAction } from "./actions";
import ErrorMessage from "@/components/ui/ErrorMessage";

/**
 * ログインフォームコンポーネント
 * 
 * Client Component として実装され、フォーム状態管理と Server Action の呼び出しを担当します。
 */
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signInAction(email, password);
      if (result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {/* メールアドレス入力 */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-900 dark:text-gray-300 mb-2"
        >
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isPending}
          autoComplete="email"
          className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 text-base"
          placeholder="example@email.com"
          aria-label="メールアドレス"
          aria-required="true"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "error-message" : undefined}
        />
      </div>

      {/* パスワード入力 */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-gray-900 dark:text-gray-300 mb-2"
        >
          パスワード
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isPending}
          autoComplete="current-password"
          className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 text-base"
          placeholder="パスワードを入力"
          aria-label="パスワード"
          aria-required="true"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "error-message" : undefined}
        />
      </div>

      {/* エラーメッセージ */}
      {error && (
        <ErrorMessage error={error} onDismiss={() => setError(null)} />
      )}

      {/* ログインボタン */}
      <button
        type="submit"
        disabled={isPending}
        className="group relative w-full px-6 py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-base sm:text-lg rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
      >
        {/* グラデーションアニメーション */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* ホバー時のシャインエフェクト */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        </div>
        
        {/* ボタンテキスト */}
        <span className="relative flex items-center justify-center gap-3 z-10">
          {isPending ? (
            <>
              <svg
                className="animate-spin h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              ログイン中...
            </>
          ) : (
            <>
              <span className="group-hover:scale-105 transition-transform duration-300">ログイン</span>
              <svg className="w-5 h-5 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </span>
      </button>
    </form>
  );
}
