# Technology Stack

## Architecture

Next.js App Router ベースの SPA/SSR ハイブリッドアーキテクチャ。
サーバーコンポーネントを基本とし、インタラクティブ要素のみクライアントコンポーネント（`"use client"`）を使用する。
バックエンドは Supabase（BaaS）に委譲し、フロントエンドに集中する構成。

## Core Technologies

- **Language**: TypeScript（strict mode）
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Runtime**: Node.js 20+
- **Styling**: Tailwind CSS v4（`@import "tailwindcss"` / `@theme inline` 記法）
- **Backend/DB**: Supabase（PostgreSQL + Auth + SSR middleware）
- **AI**: Anthropic Claude API（`@anthropic-ai/sdk`）

## Key Libraries

| Library | Purpose |
|---------|---------|
| `zustand` | 軽量クライアント状態管理 |
| `framer-motion` | アニメーション・トランジション |
| `mermaid` | 図解・ダイアグラム描画 |
| `next-mdx-remote` / `@mdx-js/react` | MDX コンテンツレンダリング |
| `@supabase/ssr` | Supabase SSR ミドルウェア統合 |

## Development Standards

### Type Safety
- TypeScript strict mode（`tsconfig.json` で `"strict": true`）
- `tsc --noEmit` による型チェック（`npm run type-check`）
- `any` 型の使用禁止

### Code Quality
- ESLint（`eslint-config-next`）によるリンティング
- Prettier によるコードフォーマット
- CI パイプラインで lint + type-check + build を自動実行

### Testing
- **E2E**: Playwright（Chromium / Firefox / WebKit の3ブラウザ対応）
- テストディレクトリ: `./e2e/`
- CI 上で E2E テストを自動実行（main ブランチへの push / PR）

## Development Environment

### Required Tools
- Node.js 20+
- npm（パッケージマネージャー）
- Playwright（E2E テスト用ブラウザドライバー）

### Common Commands
```bash
# Dev:        npm run dev
# Build:      npm run build
# Lint:       npm run lint
# Type-check: npm run type-check
# E2E test:   npm run test:e2e
# E2E UI:     npm run test:e2e:ui
```

## Key Technical Decisions

- **Next.js App Router 採用**: サーバーコンポーネント / ストリーミング / レイアウトネスト を活用
- **Supabase SSR ミドルウェア**: `middleware.ts` でセッション管理、認証ガードを一元化
- **Tailwind CSS v4**: PostCSS プラグイン方式（`@tailwindcss/postcss`）、CSS 変数によるテーマ管理
- **Zustand**: Redux の複雑さを避け、軽量な状態管理を採用
- **MDX コンテンツ**: 学習コンテンツを MDX で記述し、コードとリッチコンテンツを統合
- **GitHub Actions CI/CD**: main / develop ブランチで lint + type-check + build + E2E テスト

---
_Document standards and patterns, not every dependency_
