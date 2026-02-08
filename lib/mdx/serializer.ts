import { serialize } from "next-mdx-remote/serialize";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { detectGlossaryTermsInText, glossaryTerms } from "@/lib/data/glossary";

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
    // まず、すべての自己閉じタグ（<br/>など）を修正（MDXパーサーのエラーを防ぐ）
    // ただし、コードブロック内は除外
    let processedSource = this.fixSelfClosingTags(source);

    // Mermaid コードブロックを検出してマーク
    processedSource = this.detectMermaidBlocks(processedSource);

    // 用語を検出してGlossaryTermコンポーネントに変換
    processedSource = this.detectGlossaryTerms(processedSource);

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
   * 自己閉じタグを修正します（MDXパーサーのエラーを防ぐ）
   * 
   * @param source - MDX ソース文字列
   * @returns 処理済みソース文字列
   */
  private fixSelfClosingTags(source: string): string {
    // コードブロック内は除外
    const codeBlockRegex = /```[\s\S]*?```/g;
    const protectedAreas: Array<{ marker: string; content: string }> = [];
    let markerIndex = 0;

    // コードブロックを保護
    source = source.replace(codeBlockRegex, (match) => {
      const marker = `__PROTECTED_CODE_${markerIndex}__`;
      protectedAreas.push({ marker, content: match });
      markerIndex++;
      return marker;
    });

    // 自己閉じタグを修正（<br/> → <br>）
    let result = source.replace(/<br\s*\/>/gi, "<br>");

    // 保護した領域を復元
    for (const area of protectedAreas) {
      result = result.replace(area.marker, area.content);
    }

    return result;
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
      // Mermaid コードブロック内の <br/> を <br> に変換（MDXパーサーのエラーを防ぐ）
      const processedContent = content.trim().replace(/<br\/>/g, "<br>");
      // Mermaid コードブロックを特別なマーカーで囲む
      // MDXRenderer で検出できるようにする
      return `<MermaidDiagram>\n${processedContent}\n</MermaidDiagram>`;
    });
  }

  /**
   * テキスト内の用語を検出してGlossaryTermコンポーネントに変換します
   * 
   * @param source - MDX ソース文字列
   * @returns 処理済みソース文字列
   */
  private detectGlossaryTerms(source: string): string {
    // コードブロック、HTMLタグ、既存のGlossaryTermコンポーネント内は処理しない
    const codeBlockRegex = /```[\s\S]*?```/g;
    const htmlTagRegex = /<[^>]+>/g;
    const existingGlossaryTermRegex = /<GlossaryTerm[^>]*>[\s\S]*?<\/GlossaryTerm>/g;
    const mermaidDiagramRegex = /<MermaidDiagram>[\s\S]*?<\/MermaidDiagram>/g;

    // 処理対象外の領域をマーカーで保護
    const protectedAreas: Array<{ marker: string; content: string }> = [];
    let markerIndex = 0;

    // コードブロックを保護
    source = source.replace(codeBlockRegex, (match) => {
      const marker = `__PROTECTED_CODE_${markerIndex}__`;
      protectedAreas.push({ marker, content: match });
      markerIndex++;
      return marker;
    });

    // HTMLタグを保護
    source = source.replace(htmlTagRegex, (match) => {
      const marker = `__PROTECTED_HTML_${markerIndex}__`;
      protectedAreas.push({ marker, content: match });
      markerIndex++;
      return marker;
    });

    // 既存のGlossaryTermコンポーネントを保護
    source = source.replace(existingGlossaryTermRegex, (match) => {
      const marker = `__PROTECTED_GLOSSARY_${markerIndex}__`;
      protectedAreas.push({ marker, content: match });
      markerIndex++;
      return marker;
    });

    // MermaidDiagramを保護
    source = source.replace(mermaidDiagramRegex, (match) => {
      const marker = `__PROTECTED_MERMAID_${markerIndex}__`;
      protectedAreas.push({ marker, content: match });
      markerIndex++;
      return marker;
    });

    // 段落単位で処理（改行で分割）
    const lines = source.split("\n");
    const processedLines = lines.map((line) => {
      // 保護マーカーが含まれている場合はスキップ
      if (line.includes("__PROTECTED_")) {
        return line;
      }

      // 用語を検出
      const detectedTerms = detectGlossaryTermsInText(line);

      if (detectedTerms.length === 0) {
        return line;
      }

      // 後ろから前へ置換（インデックスがずれないように）
      let processedLine = line;
      for (let i = detectedTerms.length - 1; i >= 0; i--) {
        const detected = detectedTerms[i];
        const before = processedLine.substring(0, detected.startIndex);
        const after = processedLine.substring(detected.endIndex);
        processedLine = `${before}<GlossaryTerm termId="${detected.termId}">${detected.matchedText}</GlossaryTerm>${after}`;
      }

      return processedLine;
    });

    let result = processedLines.join("\n");

    // 保護した領域を復元
    for (const area of protectedAreas) {
      result = result.replace(area.marker, area.content);
    }

    return result;
  }
}

/**
 * MDXSerializer のシングルトンインスタンス
 */
export const mdxSerializer: MDXSerializer = new MDXSerializerImpl();
