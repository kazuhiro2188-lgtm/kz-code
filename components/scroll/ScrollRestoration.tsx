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

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. ブラウザのデフォルトのスクロール復元を無効化
    window.history.scrollRestoration = "manual";

    // 2. 現在のスクロール位置を保存
    scrollPositionRef.current = window.scrollY;

    // 3. window.scrollToをオーバーライドして、自動スクロールを防ぐ
    const originalScrollTo = window.scrollTo.bind(window);
    
    // ページ遷移時の自動スクロール（top: 0, left: 0）を防ぐ
    window.scrollTo = function(options?: ScrollToOptions | number, y?: number) {
      // 自動スクロール（top: 0）を検出して防ぐ
      if (isNavigatingRef.current) {
        // ページ遷移中は自動スクロールを無効化
        const top = typeof options === "object" && options !== null ? options.top : (typeof options === "number" ? options : 0);
        if (top === 0) {
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

    // 4. スクロールイベントを監視して、意図しないスクロールを防ぐ
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      // スクロール位置を更新
      scrollPositionRef.current = window.scrollY;
      
      // ページ遷移直後の自動スクロールを検出
      if (isNavigatingRef.current && window.scrollY === 0) {
        // 自動スクロールを検出した場合、元の位置に戻す
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (scrollPositionRef.current !== 0) {
            window.scrollTo({
              top: scrollPositionRef.current,
              behavior: "instant" as ScrollBehavior,
            });
          }
        }, 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.scrollTo = originalScrollTo;
      clearTimeout(scrollTimeout);
    };
  }, []);

  // ページ遷移を検出して、自動スクロールを防ぐ
  useEffect(() => {
    if (typeof window === "undefined") return;

    // ページ遷移開始をマーク
    isNavigatingRef.current = true;
    
    // 現在のスクロール位置を保存
    scrollPositionRef.current = window.scrollY;

    // 短時間後に自動スクロールを防ぐ
    const preventScroll = () => {
      // 自動スクロールが発生した場合、元の位置に戻す
      if (window.scrollY === 0 && scrollPositionRef.current !== 0) {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: "instant" as ScrollBehavior,
        });
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
      }, 200),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [pathname]);

  return null;
}
