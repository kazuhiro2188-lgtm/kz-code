#!/usr/bin/env tsx
/**
 * MDXファイル構造作成スクリプト
 * 
 * 不足しているMDXファイルのディレクトリ構造を作成します。
 * 実行方法: npx tsx scripts/create-mdx-structure.ts
 */

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { staticLessons } from "../lib/data/courses";

const CONTENT_BASE_PATH = join(process.cwd(), "content", "lessons");

async function createMDXStructure() {
  console.log("MDXファイル構造を作成中...");
  console.log();

  const created: string[] = [];
  const skipped: string[] = [];

  for (const lesson of staticLessons) {
    const filePath = join(CONTENT_BASE_PATH, lesson.contentPath);
    const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));

    try {
      // ディレクトリを作成
      await mkdir(dirPath, { recursive: true });

      // ファイルが存在しない場合のみ作成
      try {
        await import("fs/promises").then((fs) => fs.access(filePath));
        skipped.push(lesson.contentPath);
      } catch {
        // ファイルが存在しない場合は作成
        const template = `# ${lesson.title}

## はじめに

このレッスンでは、${lesson.title}について学びます。

## 学習内容

[ここに学習内容を記述してください]

## 重要なポイント

- [ポイント1]
- [ポイント2]
- [ポイント3]

## 実践例

[実践的な例を記述してください]

## まとめ

- [要点1]
- [要点2]
- [要点3]
`;

        await writeFile(filePath, template, "utf-8");
        created.push(lesson.contentPath);
      }
    } catch (error) {
      console.error(`エラー: ${lesson.contentPath}`, error);
    }
  }

  console.log(`✅ 作成されたファイル: ${created.length}件`);
  created.forEach((path) => console.log(`  - ${path}`));
  console.log();
  console.log(`⏭️  スキップされたファイル（既存）: ${skipped.length}件`);
  skipped.forEach((path) => console.log(`  - ${path}`));
  console.log();
  console.log(`合計: ${staticLessons.length}レッスン`);
}

createMDXStructure().catch(console.error);
