"use client";

import { useEffect, useRef, useState } from "react";

/**
 * MermaidRenderer の Props
 */
type MermaidRendererProps = {
  /**
   * Mermaid ダイアグラムのソースコード
   */
  content: string;
  /**
   * ダークモードかどうか
   */
  isDark?: boolean;
};

/**
 * MermaidRenderer コンポーネント
 * 
 * Mermaid.js を使用してダイアグラムをレンダリングします。
 * Client Component として実装され、ダークモード対応と遅延読み込みをサポートします。
 */
export default function MermaidRenderer({
  content,
  isDark = false,
}: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mermaidId] = useState(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    let mermaid: typeof import("mermaid") | null = null;
    let isMounted = true;

    const loadAndRender = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mermaid.js を動的にインポート（遅延読み込み）
        mermaid = await import("mermaid");

        // Mermaid を初期化
        mermaid.default.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif",
        });

        if (!isMounted || !containerRef.current) {
          return;
        }

        // ダイアグラムをレンダリング
        const { svg } = await mermaid.default.render(mermaidId, content);

        if (!isMounted || !containerRef.current) {
          return;
        }

        containerRef.current.innerHTML = svg;
        setIsLoading(false);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "Mermaid ダイアグラムのレンダリングに失敗しました";
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    loadAndRender();

    return () => {
      isMounted = false;
    };
  }, [content, isDark, mermaidId]);

  // ダークモードが変更された場合に再レンダリング
  useEffect(() => {
    if (!isLoading && !error && containerRef.current) {
      // テーマ変更時は再レンダリングが必要
      const loadAndRender = async () => {
        try {
          const mermaid = await import("mermaid");
          mermaid.default.initialize({
            startOnLoad: false,
            theme: isDark ? "dark" : "default",
            securityLevel: "loose",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif",
          });

          if (containerRef.current) {
            const { svg } = await mermaid.default.render(mermaidId, content);
            containerRef.current.innerHTML = svg;
          }
        } catch (err) {
          console.error("Mermaid テーマ変更エラー:", err);
        }
      };

      loadAndRender();
    }
  }, [isDark, isLoading, error, content, mermaidId]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-700 dark:text-red-400">
          ダイアグラムの表示に失敗しました: {error}
        </p>
        <details className="mt-2">
          <summary className="text-xs text-red-600 dark:text-red-500 cursor-pointer">
            ソースコードを表示
          </summary>
          <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded text-xs overflow-auto">
            <code>{content}</code>
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="my-6">
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg
              className="animate-spin h-5 w-5"
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
            <span className="text-sm">ダイアグラムを読み込み中...</span>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className={`mermaid-container ${isLoading ? "hidden" : ""}`}
        aria-label="Mermaid ダイアグラム"
      />
    </div>
  );
}
