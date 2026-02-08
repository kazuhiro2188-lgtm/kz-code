"use client";

import { useState, useEffect } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

/**
 * NetworkStatus コンポーネント
 * 
 * ネットワーク接続状態を表示する通知コンポーネントです。
 * オフライン時には警告を表示し、オンライン復帰時には成功メッセージを表示します。
 * 
 * CSSアニメーションを使用（framer-motionの代わり）して
 * SSRプリレンダリング時の互換性を確保しています。
 */
export function NetworkStatus() {
  const [mounted, setMounted] = useState(false);
  const { isOnline, wasOffline } = useNetworkStatus();

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR/プリレンダリング時は何も表示しない
  if (!mounted) return null;

  return (
    <>
      {!isOnline && (
        <div
          className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 shadow-lg animate-[slideDown_0.3s_ease-out]"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm font-medium">
              インターネット接続が切断されました。接続を確認してください。
            </p>
          </div>
        </div>
      )}
      {isOnline && wasOffline && (
        <div
          className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-3 shadow-lg animate-[slideDown_0.3s_ease-out]"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-sm font-medium">
              インターネット接続が復旧しました。
            </p>
          </div>
        </div>
      )}
    </>
  );
}
