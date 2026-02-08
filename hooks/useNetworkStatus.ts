"use client";

import { useState, useEffect } from "react";

/**
 * useNetworkStatus フック
 * 
 * ネットワーク接続状態を監視し、オンライン/オフライン状態を返します。
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    // 初期状態を設定（ブラウザがサポートしている場合）
    if (typeof window !== "undefined" && "navigator" in window) {
      setIsOnline(navigator.onLine);
    }

    // オンラインイベントのハンドラ
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // オンライン復帰後、少し遅延してフラグをリセット
      setTimeout(() => {
        setWasOffline(false);
      }, 3000);
    };

    // オフラインイベントのハンドラ
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(false);
    };

    // イベントリスナーを登録
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // クリーンアップ
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
