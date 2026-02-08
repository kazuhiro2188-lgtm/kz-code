# Research & Design Decisions Template

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

**Usage**:
- Log research activities and outcomes during the discovery phase.
- Document design decision trade-offs that are too detailed for `design.md`.
- Provide references and evidence for future audits or reuse.
---

## Summary
- **Feature**: `kz-code`
- **Discovery Scope**: New Feature (Greenfield)
- **Key Findings**:
  - Next.js 16 App Router + Supabase SSR による認証パターンが確立されている
  - Claude API ストリーミングは Server Actions または Route Handlers で実装可能
  - MDX コンテンツは Server Component でシリアライズ、Client Component でレンダリングするハイブリッドアプローチが推奨
  - Mermaid.js は Client Component でのレンダリングが必要（ブラウザ API 依存）

## Research Log

### Supabase SSR Authentication with Next.js App Router
- **Context**: 要件 1（ユーザー認証）の実装パターンを調査
- **Sources Consulted**: 
  - Supabase official docs: SSR with Next.js App Router
  - `@supabase/ssr` package documentation
- **Findings**: 
  - `@supabase/ssr` パッケージが推奨（旧 `@supabase/auth-helpers` の後継）
  - ミドルウェアでセッションリフレッシュを実装し、Server Component とブラウザ間でセッションを同期
  - Cookie ベースのセッション管理（localStorage は SSR 非対応）
  - PKCE フローがデフォルト（SSR に適している）
- **Implications**: 
  - 既存の `middleware.ts` パターンを拡張して認証ページ（`/login`, `/signup`, `/reset-password`）を実装
  - Server Component と Client Component で異なる Supabase クライアント作成関数が必要

### Anthropic Claude API Streaming Integration
- **Context**: 要件 5（AI 学習アシスタント）のストリーミング実装を調査
- **Sources Consulted**: 
  - Anthropic Claude API documentation: Streaming Messages API
  - Next.js App Router integration patterns
- **Findings**: 
  - `stream: true` オプションでストリーミング有効化
  - `content_block_delta` イベントでテキストチャンクを取得
  - Server Actions は 15-30 秒のタイムアウト制限あり
  - Route Handlers を使用するとタイムアウト制限を回避可能
  - API キーはサーバーサイドのみで管理（環境変数）
- **Implications**: 
  - Route Handler (`/api/chat`) でストリーミング実装
  - Client Component で `fetch` を使用してストリームを処理
  - エラーハンドリングとリトライロジックが必要

### MDX Content Rendering Strategy
- **Context**: 要件 4（学習コンテンツ配信）の MDX レンダリング方法を調査
- **Sources Consulted**: 
  - `next-mdx-remote` documentation
  - Next.js App Router MDX integration guide
- **Findings**: 
  - `next-mdx-remote` は Server Component で `serialize()`、Client Component で `<MDXRemote />` を使用
  - Server Component でシリアライズすることでバンドルサイズを削減
  - `remark-gfm`, `rehype-slug` などのプラグインで拡張可能
  - Turbopack 使用時は `transpilePackages` 設定が必要
- **Implications**: 
  - Server Component で MDX ファイルを読み込み・シリアライズ
  - Client Component でレンダリング（インタラクティブ要素対応）
  - Mermaid コードブロックは別途 Client Component で処理

### Mermaid.js Rendering in Next.js
- **Context**: 要件 7（図解・ビジュアライゼーション）の実装方法を調査
- **Sources Consulted**: 
  - Mermaid.js React integration patterns
  - Next.js Server Components vs Client Components decision tree
- **Findings**: 
  - Mermaid.js はブラウザ API に依存するため Client Component でのレンダリングが必要
  - Server Component で Markdown をパースし、`<pre class="mermaid">` タグを検出
  - Client Component で Mermaid ライブラリをロードして SVG を生成
  - ビルド時 SVG 生成はパフォーマンス問題を引き起こす可能性
- **Implications**: 
  - MDX コンテンツ内の Mermaid コードブロックを Client Component で処理
  - ダークモード/ライトモード対応のためテーマ設定が必要

### Supabase Row Level Security (RLS)
- **Context**: 要件 10（セキュリティ）の RLS 実装を調査
- **Sources Consulted**: 
  - Supabase RLS documentation
  - Next.js App Router security best practices
- **Findings**: 
  - すべてのテーブルで RLS を有効化（デフォルトで有効だが手動作成時は明示的に有効化）
  - `auth.uid()` を使用してユーザー固有のデータアクセスを制御
  - ポリシーは `USING` 句（読み取り）と `WITH CHECK` 句（書き込み）で定義
  - データベースレベルで強制されるため、アプリケーションロジックのバグを防げる
- **Implications**: 
  - ユーザー進捗データ（`user_progress`, `lesson_completions` など）に RLS ポリシーを設定
  - `auth.uid() = user_id` 条件でユーザー自身のデータのみアクセス可能にする

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Feature-First (App Router) | Next.js App Router のファイルシステムルーティングに従う | ルーティングが明確、コロケーション可能 | 大規模化すると構造が複雑化 | 既存の steering パターンと一致 |
| Layered Architecture | UI / Domain / Data レイヤー分離 | 責務が明確、テスタビリティ高い | App Router の Server Component パターンと相性が悪い | 既存パターンと不一致 |
| Domain-Driven Design | ドメイン境界で分離 | ビジネスロジックの明確化 | 初期段階では過剰設計の可能性 | 将来の拡張性を考慮 |

**Selected Approach**: Feature-First (App Router) パターンを採用。既存の steering パターンと一致し、Next.js App Router の規約に従う。

## Design Decisions

### Decision: Server-First Component Architecture
- **Context**: Next.js App Router の Server Component を基本とし、必要最小限の Client Component を使用
- **Alternatives Considered**:
  1. すべて Client Component — シンプルだがバンドルサイズが大きくなる
  2. すべて Server Component — パフォーマンスは良いがインタラクティブ要素が制限される
- **Selected Approach**: Server Component をデフォルトとし、インタラクティブ要素（フォーム、AI チャット、Mermaid レンダリング）のみ Client Component
- **Rationale**: バンドルサイズを最小化しつつ、必要なインタラクティビティを確保。steering の "Server-first" 原則と一致
- **Trade-offs**: 
  - ✅ バンドルサイズ削減、SEO 最適化
  - ❌ Client Component 境界の設計が必要
- **Follow-up**: コンポーネント分割時に Server/Client 境界を明確に文書化

### Decision: Supabase SSR Authentication Pattern
- **Context**: 認証フローをミドルウェアで一元管理
- **Alternatives Considered**:
  1. 各ページで個別に認証チェック — 重複コードが発生
  2. カスタム認証システム — Supabase の利点を活用できない
- **Selected Approach**: `middleware.ts` で認証ガードを実装し、既存パターンを拡張
- **Rationale**: 既存の `middleware.ts` パターンを活用し、steering の "Auth boundary" 原則に従う
- **Trade-offs**: 
  - ✅ 一元管理、DRY 原則
  - ❌ ミドルウェアの複雑度が増加
- **Follow-up**: 認証ページ実装時にミドルウェアロジックをテスト

### Decision: MDX Content Storage Strategy
- **Context**: 学習コンテンツの保存方法（ファイルシステム vs データベース）
- **Alternatives Considered**:
  1. ファイルシステム（`/content/` ディレクトリ） — シンプル、Git で管理可能
  2. Supabase Storage + データベースメタデータ — 動的コンテンツ管理が可能
- **Selected Approach**: 初期はファイルシステム、将来の拡張性を考慮してデータベースメタデータも併用
- **Rationale**: 開発初期はファイルシステムで十分。将来 CMS 化する際はデータベースに移行可能な設計
- **Trade-offs**: 
  - ✅ シンプル、バージョン管理可能
  - ❌ 動的コンテンツ更新には不向き
- **Follow-up**: コンテンツ管理要件が明確化したら再評価

### Decision: AI Assistant Streaming Implementation
- **Context**: Claude API ストリーミングの実装方法
- **Alternatives Considered**:
  1. Server Actions — シンプルだがタイムアウト制限あり
  2. Route Handler — タイムアウト制限なし、より柔軟
- **Selected Approach**: Route Handler (`/api/chat/stream`) でストリーミング実装
- **Rationale**: 長文回答に対応するためタイムアウト制限を回避。Server Actions は 15-30 秒制限
- **Trade-offs**: 
  - ✅ タイムアウト制限なし、柔軟なエラーハンドリング
  - ❌ Route Handler の実装が必要
- **Follow-up**: ストリーミングパフォーマンスを監視

## Risks & Mitigations
- **Risk 1**: Claude API レート制限 — ユーザーごとのレート制限とキューイングを実装
- **Risk 2**: MDX コンテンツの大容量化 — コード分割と遅延読み込みで対応
- **Risk 3**: Supabase RLS ポリシーの複雑化 — ポリシーを段階的に追加し、テストを徹底
- **Risk 4**: Mermaid レンダリングのパフォーマンス — クライアントサイドでの遅延読み込みとメモ化

## References
- [Supabase Auth with Next.js App Router](https://supabase.com/docs/guides/auth/server-side/nextjs) — SSR 認証パターン
- [Anthropic Claude API Streaming](https://docs.anthropic.com/claude/reference/streaming) — ストリーミング実装
- [next-mdx-remote](https://www.npmjs.com/package/next-mdx-remote) — MDX レンダリングライブラリ
- [Mermaid.js Documentation](https://mermaid.js.org/) — ダイアグラム描画
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) — RLS ベストプラクティス
