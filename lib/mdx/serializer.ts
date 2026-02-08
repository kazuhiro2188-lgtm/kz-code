import { serialize } from "next-mdx-remote/serialize";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";

/**
 * MDXSerializer インターフェース
 * 
 * MDX コンテンツのシリアライズを抽象化します。
 */
export interface MDXSerializer {
  /**
   * MDX ソース文字列をシリアライズします
   * 
   * @param source - MDX ソース文字列
   * @returns シリアライズ済み MDX
   */
  serialize(source: string): Promise<MDXRemoteSerializeResult>;
}

/**
 * MDXSerializer の実装
 */
class MDXSerializerImpl implements MDXSerializer {
  async serialize(source: string): Promise<MDXRemoteSerializeResult> {
    // Mermaid コードブロックを検出してマーク
    const processedSource = this.detectMermaidBlocks(source);

    // MDX をシリアライズ
    const serialized = await serialize(processedSource, {
      mdxOptions: {
        remarkPlugins: [
          // remark-gfm は必要に応じて追加
          // 現時点では基本的なシリアライズのみ
        ],
        rehypePlugins: [
          // rehype-slug は必要に応じて追加
          // 現時点では基本的なシリアライズのみ
        ],
      },
      parseFrontmatter: true,
    });

    return serialized;
  }

  /**
   * Mermaid コードブロックを検出してマークします
   * 
   * @param source - MDX ソース文字列
   * @returns 処理済みソース文字列
   */
  private detectMermaidBlocks(source: string): string {
    // Mermaid コードブロックのパターン: ```mermaid ... ```
    const mermaidBlockRegex = /```mermaid\n([\s\S]*?)```/g;

    return source.replace(mermaidBlockRegex, (match, content) => {
      // Mermaid コードブロックを特別なマーカーで囲む
      // MDXRenderer で検出できるようにする
      return `<MermaidDiagram>\n${content.trim()}\n</MermaidDiagram>`;
    });
  }
}

/**
 * MDXSerializer のシングルトンインスタンス
 */
export const mdxSerializer: MDXSerializer = new MDXSerializerImpl();
