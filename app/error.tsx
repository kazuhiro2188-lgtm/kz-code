"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録（本番環境ではエラートラッキングサービスに送信）
    console.error("エラーバウンダリでキャッチされたエラー:", error);
  }, [error]);

  // ユーザーフレンドリーなエラーメッセージを生成
  const getErrorMessage = () => {
    if (error.message) {
      return error.message;
    }
    return "予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください。";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        className="text-center max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            ⚠️
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            エラーが発生しました
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {getErrorMessage()}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-6 font-mono">
              エラーID: {error.digest}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              再試行
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors duration-200"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
