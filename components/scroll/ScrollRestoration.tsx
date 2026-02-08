"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ページ遷移時の自動スクロールを無効化するコンポーネント
 */
export function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // ページ遷移時にスクロール位置を保持（自動スクロールを無効化）
    // Next.jsのデフォルトのスクロール動作を上書き
    if (typeof window !== "undefined") {
      // スクロール位置を保持
      const scrollPositions = sessionStorage.getItem("scrollPositions");
      const positions = scrollPositions ? JSON.parse(scrollPositions) : {};
      
      // 現在のページのスクロール位置を保存
      const saveScrollPosition = () => {
        positions[pathname] = window.scrollY;
        sessionStorage.setItem("scrollPositions", JSON.stringify(positions));
      };

      // ページ遷移前にスクロール位置を保存
      window.addEventListener("beforeunload", saveScrollPosition);

      // ページ遷移後の自動スクロールを防ぐ
      // Next.jsはデフォルトでページ遷移時にトップにスクロールするため、
      // それを防ぐために少し遅延させてスクロール位置を復元
      const timer = setTimeout(() => {
        // 自動スクロールを防ぐため、何もしない
        // 必要に応じて、保存されたスクロール位置を復元することも可能
        // if (positions[pathname]) {
        //   window.scrollTo(0, positions[pathname]);
        // }
      }, 0);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeunload", saveScrollPosition);
      };
    }
  }, [pathname]);

  // ページ遷移時の自動スクロールを完全に無効化
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Next.jsのデフォルトのスクロール動作を無効化
      const preventAutoScroll = () => {
        // ページ遷移時の自動スクロールを防ぐ
        window.history.scrollRestoration = "manual";
      };

      preventAutoScroll();
    }
  }, []);

  return null;
}
