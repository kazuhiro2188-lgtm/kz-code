#!/usr/bin/env tsx
/**
 * MDXコンパイルテストスクリプト
 * 
 * すべてのMDXファイルが正しくコンパイルできるかテストします。
 * 実行方法: npx tsx scripts/test-mdx-compilation.ts
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { serialize } from "next-mdx-remote/serialize";

const CONTENT_BASE_PATH = join(process.cwd(), "content", "lessons");

interface TestResult {
  file: string;
  success: boolean;
  error?: string;
}

async function findMDXFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findMDXFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function testMDXFile(filePath: string): Promise<TestResult> {
  try {
    const content = await readFile(filePath, "utf-8");
    await serialize(content, {
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [],
      },
      parseFrontmatter: true,
    });

    return {
      file: filePath.replace(process.cwd() + "/", ""),
      success: true,
    };
  } catch (error) {
    return {
      file: filePath.replace(process.cwd() + "/", ""),
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testAllMDXFiles() {
  console.log("MDXファイルのコンパイルテストを開始...\n");

  const mdxFiles = await findMDXFiles(CONTENT_BASE_PATH);
  console.log(`見つかったMDXファイル: ${mdxFiles.length}件\n`);

  const results: TestResult[] = [];
  for (const file of mdxFiles) {
    const result = await testMDXFile(file);
    results.push(result);
    if (result.success) {
      process.stdout.write(".");
    } else {
      process.stdout.write("F");
    }
  }

  console.log("\n");

  const failed = results.filter((r) => !r.success);
  const passed = results.filter((r) => r.success);

  console.log(`\n✅ 成功: ${passed.length}件`);
  if (failed.length > 0) {
    console.log(`❌ 失敗: ${failed.length}件\n`);
    console.log("失敗したファイル:");
    for (const result of failed) {
      console.log(`\n📄 ${result.file}`);
      console.log(`   エラー: ${result.error}`);
    }
    process.exit(1);
  } else {
    console.log(`❌ 失敗: 0件\n`);
    console.log("すべてのMDXファイルが正常にコンパイルされました！");
    process.exit(0);
  }
}

testAllMDXFiles().catch((error) => {
  console.error("テスト実行エラー:", error);
  process.exit(1);
});
