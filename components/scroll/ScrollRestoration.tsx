"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * ページ遷移時の自動スクロールを完全に無効化するコンポーネント
 */
export function ScrollRestoration() {
  const pathname = usePathname();
  const scrollPositionRef = useRef<number>(0);
  const isNavigatingRef = useRef<boolean>(false);
  const originalScrollToRef = useRef<typeof window.scrollTo | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. ブラウザのデフォルトのスクロール復元を無効化
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // 2. 現在のスクロール位置を保存
    scrollPositionRef.current = window.scrollY || window.pageYOffset || 0;

    // 3. window.scrollToをオーバーライドして、自動スクロールを防ぐ
    if (!originalScrollToRef.current) {
      originalScrollToRef.current = window.scrollTo.bind(window);
    }
    
    const originalScrollTo = originalScrollToRef.current;
    
    // ページ遷移時の自動スクロール（top: 0, left: 0）を防ぐ
    window.scrollTo = function(options?: ScrollToOptions | number, y?: number) {
      // 自動スクロール（top: 0）を検出して防ぐ
      if (isNavigatingRef.current) {
        const top = typeof options === "object" && options !== null 
          ? (options.top ?? 0) 
          : (typeof options === "number" ? options : 0);
        if (top === 0 && (typeof options !== "object" || !options?.behavior)) {
          // ページ遷移中の自動スクロールを無視
          return;
        }
      }
      
      // 通常のスクロールは許可
      if (typeof options === "object" && options !== null) {
        return originalScrollTo(options);
      } else if (typeof options === "number") {
        return originalScrollTo(options, y ?? 0);
      }
      return originalScrollTo(0, 0);
    };

    return () => {
      if (originalScrollToRef.current) {
        window.scrollTo = originalScrollToRef.current;
      }
    };
  }, []);

  // ページ遷移を検出して、自動スクロールを防ぐ
  useEffect(() => {
    if (typeof window === "undefined") return;

    // ページ遷移開始をマーク
    isNavigatingRef.current = true;
    
    // 現在のスクロール位置を保存
    scrollPositionRef.current = window.scrollY || window.pageYOffset || 0;

    // 短時間後に自動スクロールを防ぐ
    const preventScroll = () => {
      // 自動スクロールが発生した場合、元の位置に戻す
      const currentScroll = window.scrollY || window.pageYOffset || 0;
      if (currentScroll === 0 && scrollPositionRef.current !== 0) {
        if (originalScrollToRef.current) {
          originalScrollToRef.current({
            top: scrollPositionRef.current,
            behavior: "instant" as ScrollBehavior,
          });
        }
      }
    };

    // 複数のタイミングでチェック（Next.jsのスクロールタイミングに対応）
    const timers = [
      setTimeout(preventScroll, 0),
      setTimeout(preventScroll, 10),
      setTimeout(preventScroll, 50),
      setTimeout(preventScroll, 100),
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 300),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [pathname]);

  return null;
}
