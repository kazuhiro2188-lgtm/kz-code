"use client";

import { useState, useRef, useEffect } from "react";
import { getGlossaryTermById, type GlossaryTerm } from "@/lib/data/glossary";

type GlossaryTermProps = {
  /**
   * 用語ID
   */
  termId: string;
  /**
   * 表示するテキスト（省略可能、指定しない場合は用語名を使用）
   */
  children?: React.ReactNode;
  /**
   * インライン表示かどうか（デフォルト: true）
   */
  inline?: boolean;
};

/**
 * GlossaryTerm コンポーネント
 * 
 * 用語にアンダーラインを表示し、クリック/タップでポップアップを表示します。
 */
export default function GlossaryTerm({
  termId,
  children,
  inline = true,
}: GlossaryTermProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const term = getGlossaryTermById(termId);

  // 用語が見つからない場合は通常のテキストとして表示
  if (!term) {
    return <span>{children || termId}</span>;
  }

  const displayText = children || term.term;

  // ポップアップの位置を計算
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // ポップアップを要素の下に配置（画面外の場合は上に配置）
      const popupHeight = 200; // 推定値
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top: number;
      if (spaceBelow >= popupHeight || spaceBelow > spaceAbove) {
        // 下に配置
        top = rect.bottom + scrollY + 8;
      } else {
        // 上に配置
        top = rect.top + scrollY - popupHeight - 8;
      }

      // 左端を要素の左端に合わせる（画面外の場合は調整）
      let left = rect.left + scrollX;
      const popupWidth = 320; // 推定値
      if (left + popupWidth > window.innerWidth + scrollX) {
        left = window.innerWidth + scrollX - popupWidth - 16;
      }
      if (left < scrollX) {
        left = scrollX + 16;
      }

      setPosition({ top, left });
    }
  }, [isOpen]);

  // クリック外部で閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <span
        ref={containerRef}
        className={`relative ${inline ? "inline" : "block"} cursor-help underline decoration-dotted decoration-blue-500 dark:decoration-blue-400 underline-offset-2 hover:decoration-solid transition-all`}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${term.term}の説明を表示`}
        aria-expanded={isOpen}
      >
        {displayText}
      </span>

      {isOpen && position && (
        <div
          ref={popupRef}
          className="fixed z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          role="dialog"
          aria-labelledby={`glossary-term-${termId}-title`}
          aria-describedby={`glossary-term-${termId}-description`}
        >
          {/* ヘッダー */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3
                id={`glossary-term-${termId}-title`}
                className="text-lg font-semibold text-gray-900 dark:text-white mb-1"
              >
                {term.term}
              </h3>
              {term.reading && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {term.reading}
                </p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="閉じる"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* カテゴリバッジ */}
          <div className="mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              {getCategoryLabel(term.category)}
            </span>
          </div>

          {/* 説明 */}
          <p
            id={`glossary-term-${termId}-description`}
            className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3"
          >
            {term.description}
          </p>

          {/* 関連用語 */}
          {term.relatedTerms && term.relatedTerms.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                関連用語
              </p>
              <div className="flex flex-wrap gap-2">
                {term.relatedTerms.map((relatedTermId) => {
                  const relatedTerm = getGlossaryTermById(relatedTermId);
                  if (!relatedTerm) return null;
                  return (
                    <span
                      key={relatedTermId}
                      className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {relatedTerm.term}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/**
 * カテゴリラベルを取得
 */
function getCategoryLabel(category: GlossaryTerm["category"]): string {
  const labels: Record<GlossaryTerm["category"], string> = {
    infrastructure: "インフラ",
    architecture: "アーキテクチャ",
    database: "データベース",
    cloud: "クラウド",
    security: "セキュリティ",
    ai: "AI・機械学習",
    development: "開発",
    general: "一般",
  };
  return labels[category] || "一般";
}
