"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { useMemo, memo } from "react";
import dynamic from "next/dynamic";
import GlossaryTerm from "../glossary/GlossaryTerm";

// MermaidRendererを動的インポート（コード分割）
const MermaidRenderer = dynamic(() => import("./MermaidRenderer"), {
  loading: () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-pulse text-gray-400 dark:text-gray-600">図解を読み込み中...</div>
    </div>
  ),
  ssr: false, // クライアントサイドのみでレンダリング
});

/**
 * MDXRenderer の Props
 */
type MDXRendererProps = {
  /**
   * シリアライズ済み MDX
   */
  source: MDXRemoteSerializeResult;
  /**
   * ダークモードかどうか
   */
  isDark?: boolean;
};

/**
 * MDXRenderer コンポーネント
 * 
 * シリアライズ済み MDX をレンダリングします。
 * Client Component として実装され、Mermaid コードブロックを自動検出して MermaidRenderer に委譲します。
 */
function MDXRenderer({ source, isDark = false }: MDXRendererProps) {
  // カスタムコンポーネントを定義
  const components = useMemo(
    () => ({
      // コードブロックのカスタムレンダリング
      code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
        const match = /language-(\w+)/.exec(className || "");
        const language = match ? match[1] : "";

        // Mermaid コードブロックの場合は MermaidRenderer を使用
        if (language === "mermaid") {
          return <MermaidRenderer content={String(children).replace(/\n$/, "")} isDark={isDark} />;
        }

        // 通常のコードブロック
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },

      // MermaidDiagram カスタムコンポーネント（MDXSerializer で生成）
      MermaidDiagram: ({ children }: { children?: React.ReactNode }) => {
        const content = typeof children === "string" ? children : String(children);
        const MermaidComponent = MermaidRenderer as React.ComponentType<{ content: string; isDark?: boolean }>;
        return <MermaidComponent content={content.trim()} isDark={isDark} />;
      },

      // GlossaryTerm カスタムコンポーネント（用語解説）
      GlossaryTerm: ({
        termId,
        children,
      }: {
        termId: string;
        children?: React.ReactNode;
      }) => {
        return <GlossaryTerm termId={termId}>{children}</GlossaryTerm>;
      },

      // 見出しのスタイリング
      h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props} />
      ),
      h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white" {...props} />
      ),
      h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200" {...props} />
      ),
      h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h4 className="text-lg font-semibold mt-3 mb-2 text-gray-800 dark:text-gray-200" {...props} />
      ),

      // 段落のスタイリング
      p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />
      ),

      // リストのスタイリング
      ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
        <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300" {...props} />
      ),
      ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
        <ol className="mb-4 ml-6 list-decimal space-y-2 text-gray-700 dark:text-gray-300" {...props} />
      ),
      li: (props: React.HTMLAttributes<HTMLLIElement>) => (
        <li className="leading-relaxed" {...props} />
      ),

      // リンクのスタイリング
      a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
          {...props}
        />
      ),

      // ブロッククォートのスタイリング
      blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
        <blockquote
          className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-600 dark:text-gray-400"
          {...props}
        />
      ),

      // テーブルのスタイリング
      table: (props: React.HTMLAttributes<HTMLTableElement>) => (
        <div className="overflow-x-auto my-6">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700" {...props} />
        </div>
      ),
      thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
        <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
      ),
      tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
        <tbody {...props} />
      ),
      tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
        <tr className="border-b border-gray-300 dark:border-gray-700" {...props} />
      ),
      th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white" {...props} />
      ),
      td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <td className="px-4 py-2 text-gray-700 dark:text-gray-300" {...props} />
      ),

      // コードブロック（pre）のスタイリング
      pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
        <pre
          className="overflow-x-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg my-4 text-sm"
          {...props}
        />
      ),
    }),
    [isDark]
  );

  return (
    <div className="mdx-content prose prose-lg dark:prose-invert max-w-none">
      <MDXRemote {...source} components={components} />
    </div>
  );
}

// メモ化してパフォーマンス最適化
export default memo(MDXRenderer);
