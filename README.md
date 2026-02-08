# KZ-Code

AI駆動開発における基礎理論・設計原理を学ぶ学習アプリ

## 技術スタック

- **フレームワーク**: Next.js 16.1.6 (App Router)
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS v4
- **バックエンド/DB**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **状態管理**: Zustand
- **アニメーション**: Framer Motion
- **図解**: Mermaid.js
- **テスト**: Playwright
- **ホスティング**: Vercel
- **バージョン管理**: Git + GitHub

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成し、必要な値を設定してください。

```bash
cp .env.local.example .env.local
```

### 3. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクトURLとAPIキーを`.env.local`に設定
3. `supabase/migrations/`内のマイグレーションファイルを実行

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## スクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバー起動
- `npm run lint` - ESLint実行
- `npm run type-check` - TypeScript型チェック
- `npm test` - Vitest統合テスト実行
- `npm run test:watch` - Vitestウォッチモード
- `npm run test:coverage` - テストカバレッジレポート生成
- `npm run test:e2e` - Playwright E2Eテスト実行
- `npm run test:e2e:ui` - Playwright UIモードでテスト実行

## テスト

### 統合テスト（Vitest）

統合テストは`__tests__/integration/`ディレクトリにあります。

```bash
npm test
```

### E2Eテスト（Playwright）

E2Eテストは`e2e/`ディレクトリにあります。実行前に以下の環境変数を設定してください：

- `E2E_TEST_USER_EMAIL` - テスト用ユーザーのメールアドレス（デフォルト: `test@example.com`）
- `E2E_TEST_USER_PASSWORD` - テスト用ユーザーのパスワード（デフォルト: `TestPassword123`）

```bash
# 環境変数を設定して実行
E2E_TEST_USER_EMAIL=test@example.com E2E_TEST_USER_PASSWORD=TestPassword123 npm run test:e2e
```

**注意**: E2Eテストは実際のSupabaseとClaude APIを使用します。テスト用のアカウントを用意してください。

## プロジェクト構造

詳細は `docs/folder-structure.md` を参照してください。

## ドキュメント

- [機能要件定義書](./docs/functional-requirements.md)
- [非機能要件定義書](./docs/non-functional-requirements.md)
- [画面遷移図](./docs/screen-flow.mmd)
- [フォルダ構成](./docs/folder-structure.md)
