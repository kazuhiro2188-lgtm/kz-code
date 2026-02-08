# Implementation Plan

## Task Format Template

Use whichever pattern fits the work breakdown:

### Major task only
- [ ] {{NUMBER}}. {{TASK_DESCRIPTION}}{{PARALLEL_MARK}}
  - {{DETAIL_ITEM_1}} *(Include details only when needed. If the task stands alone, omit bullet items.)*
  - _Requirements: {{REQUIREMENT_IDS}}_

### Major + Sub-task structure
- [ ] {{MAJOR_NUMBER}}. {{MAJOR_TASK_SUMMARY}}
- [ ] {{MAJOR_NUMBER}}.{{SUB_NUMBER}} {{SUB_TASK_DESCRIPTION}}{{SUB_PARALLEL_MARK}}
  - {{DETAIL_ITEM_1}}
  - {{DETAIL_ITEM_2}}
  - _Requirements: {{REQUIREMENT_IDS}}_ *(IDs only; do not add descriptions or parentheses.)*

> **Parallel marker**: Append `(P)` only to tasks that can be executed in parallel. Omit the marker when running in `--sequential` mode.
>
> **Optional test coverage**: When a sub-task is deferrable test work tied to acceptance criteria, mark the checkbox as `- [ ]*` and explain the referenced requirements in the detail bullets.

- [ ] 1. Supabase データベーススキーマと RLS ポリシーの実装
- [x] 1.1 (P) ユーザープロフィールテーブルと RLS ポリシーの作成
  - `profiles` テーブルを作成（`id`, `onboarding_completed`, `learning_goal`, `experience_level`, `updated_at`）
  - `profiles` テーブルに RLS を有効化し、`SELECT`, `UPDATE` ポリシーを設定（`auth.uid() = id`）
  - `profiles.id` を `auth.users.id` への外部キーとして設定
  - _Requirements: 2.1, 2.2, 10.2_

- [x] 1.2 (P) コース・セクション・レッスンテーブルと RLS ポリシーの作成
  - `courses`, `sections`, `lessons` テーブルを作成（階層構造を維持）
  - 外部キー制約を設定（`sections.course_id`, `lessons.section_id`）
  - 読み取り専用の RLS ポリシーを設定（すべての認証済みユーザーがアクセス可能）
  - インデックスを追加（`sections(course_id)`, `lessons(section_id)`）
  - _Requirements: 4.3, 10.2_

- [x] 1.3 (P) 学習進捗テーブルと RLS ポリシーの作成
  - `lesson_completions` テーブルを作成（`id`, `user_id`, `lesson_id`, `completed_at`）
  - `(user_id, lesson_id)` にユニーク制約を設定
  - RLS ポリシーを設定（`SELECT`, `INSERT` で `auth.uid() = user_id`）
  - `learning_history` テーブルを作成（`id`, `user_id`, `lesson_id`, `duration_seconds`, `accessed_at`）
  - `learning_history` に RLS ポリシーを設定（`SELECT`, `INSERT` で `auth.uid() = user_id`）
  - インデックスを追加（`lesson_completions(user_id, lesson_id)`, `learning_history(user_id, accessed_at)`）
  - _Requirements: 6.1, 6.4, 10.2_

- [x] 1.4 (P) AI チャット会話テーブルと RLS ポリシーの作成
  - `chat_conversations` テーブルを作成（`id`, `user_id`, `lesson_id`, `created_at`, `updated_at`）
  - `chat_messages` テーブルを作成（`id`, `conversation_id`, `role`, `content`, `created_at`, `order_index`）
  - RLS ポリシーを設定（`chat_conversations`: `SELECT`, `INSERT`, `UPDATE` で `auth.uid() = user_id`、`chat_messages`: `SELECT`, `INSERT` で会話所有者のみアクセス可能）
  - インデックスを追加（`chat_messages(conversation_id, order_index)`）
  - _Requirements: 5.3, 10.2_

- [x] 2. Supabase クライアントユーティリティと認証サービスの実装
- [x] 2.1 Server Component 用 Supabase クライアント作成関数の実装
  - `lib/supabase/server.ts` に `createServerSupabaseClient()` 関数を実装
  - Cookie ベースのセッション管理を設定
  - Server Component から呼び出し可能なインターフェースを提供
  - _Requirements: 1.6, 10.1_

- [x] 2.2 Client Component 用 Supabase クライアント作成関数の実装
  - `lib/supabase/client.ts` に `createBrowserSupabaseClient()` 関数を実装
  - ブラウザ環境でのセッション管理を設定
  - Client Component から呼び出し可能なインターフェースを提供
  - _Requirements: 1.6, 10.1_

- [x] 2.3 AuthService の実装
  - `lib/services/auth.ts` に `AuthService` インターフェースを実装
  - `signUp()`, `signIn()`, `resetPassword()`, `signOut()` メソッドを実装
  - Supabase Auth のエラーをアプリケーション固有のエラー型に変換
  - メールアドレス・パスワード形式の検証を実装
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. 認証ページの実装
- [x] 3.1 ログインページの実装
  - `app/login/page.tsx` を Server Component として作成
  - `app/login/LoginForm.tsx` を Client Component として作成（フォーム状態管理）
  - メールアドレス・パスワード入力フィールドを実装
  - AuthService を Server Action 経由で呼び出し
  - エラーメッセージの日本語表示を実装
  - 成功時に `/dashboard` へリダイレクト
  - _Requirements: 1.2, 9.4_

- [x] 3.2 サインアップページの実装
  - `app/signup/page.tsx` を Server Component として作成
  - `app/signup/SignUpForm.tsx` を Client Component として作成（フォーム状態管理）
  - メールアドレス・パスワード入力フィールドを実装
  - パスワード確認フィールドを実装
  - AuthService を Server Action 経由で呼び出し
  - エラーメッセージの日本語表示を実装
  - 成功時にプロフィールを作成し `/onboarding` へリダイレクト
  - _Requirements: 1.1, 9.4_

- [x] 3.3 パスワードリセットページの実装
  - `app/reset-password/page.tsx` を Server Component として作成
  - `app/reset-password/ResetPasswordForm.tsx` を Client Component として作成（フォーム状態管理）
  - メールアドレス入力フィールドを実装
  - AuthService を Server Action 経由で呼び出し
  - エラーメッセージの日本語表示を実装
  - 成功時に確認メッセージを表示
  - _Requirements: 1.3, 9.4_

- [x] 4. ミドルウェアの拡張実装
- [x] 4.1 認証ページへの認証済みユーザーリダイレクト機能の追加
  - `middleware.ts` に認証ページ（`/login`, `/signup`, `/reset-password`）へのアクセス時に認証済みユーザーを `/dashboard` へリダイレクトするロジックを追加
  - 既存の未認証ユーザーリダイレクトロジックと統合
  - _Requirements: 1.5_

- [x] 4.2 オンボーディング未完了ユーザーのリダイレクト機能の追加
  - `middleware.ts` にオンボーディング未完了チェックを追加
  - オンボーディング未完了の認証済みユーザーを `/onboarding` へリダイレクト
  - `/onboarding` ページ自体へのアクセスは許可
  - _Requirements: 2.3_

- [x] 5. ユーザープロフィールサービスの実装
- [x] 5.1 UserProfileService の実装
  - `lib/services/user-profile.ts` に `UserProfileService` インターフェースを実装
  - `getOnboardingStatus()` メソッドを実装（`profiles` テーブルから取得）
  - `completeOnboarding()` メソッドを実装（`onboarding_completed`, `learning_goal`, `experience_level` を更新）
  - エラーハンドリングを実装
  - _Requirements: 2.1, 2.2_

- [x] 6. オンボーディングページの実装
- [x] 6.1 オンボーディングページの実装
  - `app/onboarding/page.tsx` を Server Component として作成
  - `app/onboarding/OnboardingForm.tsx` を Client Component として作成（フォーム状態管理）
  - 学習目標選択フィールドを実装（5つの選択肢）
  - 経験レベル選択フィールドを実装（初心者・中級者・上級者）
  - UserProfileService を Server Action 経由で呼び出し
  - 完了時に `/dashboard` へリダイレクト
  - 既にオンボーディング完了の場合は自動リダイレクト
  - _Requirements: 2.1, 2.2_

- [x] 7. 進捗管理サービスの実装
- [x] 7.1 ProgressService の実装
  - `lib/services/progress.ts` に `ProgressService` インターフェースを実装
  - `completeLesson()` メソッドを実装（`lesson_completions` テーブルに挿入、重複チェック）
  - `getProgressSummary()` メソッドを実装（完了レッスン数、進捗率、最近の活動を取得）
  - `calculateProgress()` メソッドを実装（コースごとの進捗率を算出）
  - `getLessonStatus()` メソッドを実装（レッスンの完了/未完了ステータスを取得）
  - `saveHistory()` メソッドを実装（`learning_history` テーブルに記録）
  - エラーハンドリングを実装
  - _Requirements: 3.1, 6.1, 6.2, 6.3, 6.4_

- [x] 8. コンテンツサービスの実装
- [x] 8.1 ContentService の実装
  - `lib/services/content.ts` に `ContentService` インターフェースを実装
  - `listCourses()` メソッドを実装（`courses` テーブルから取得）
  - `getCourse()` メソッドを実装（コース詳細を取得）
  - `getLesson()` メソッドを実装（レッスンメタデータを取得、階層構造の整合性チェック）
  - `getLessonContent()` メソッドを実装（MDX ファイルをファイルシステムから読み込み）
  - `getRecommendedLessons()` メソッドを実装（ユーザーの進捗に基づいて推奨レッスンを取得）
  - `getLessonContext()` メソッドを実装（AI コンテキスト用にレッスン内容とメタデータを取得）
  - エラーハンドリングを実装
  - _Requirements: 3.2, 3.3, 4.2, 4.3, 4.5, 5.4_

- [x] 9. MDX コンテンツレンダリングの実装
- [x] 9.1 MDXSerializer の実装
  - `lib/mdx/serializer.ts` に `MDXSerializer` を実装
  - `next-mdx-remote` の `serialize()` 関数を使用
  - Mermaid コードブロックの検出ロジックを実装（カスタムコンポーネントに変換）
  - プラグインは必要に応じて後から追加可能な構造
  - _Requirements: 4.1, 7.2_

- [x] 9.2 MDXRenderer コンポーネントの実装
  - `components/mdx/MDXRenderer.tsx` を Client Component として作成
  - `next-mdx-remote` の `<MDXRemote />` コンポーネントを使用
  - カスタムコンポーネント（見出し、段落、リスト、テーブル、コードブロックなど）をサポート
  - Mermaid コードブロックを検出して MermaidRenderer に委譲
  - ダークモード対応のスタイリング
  - _Requirements: 4.1, 7.2_

- [x] 9.3 MermaidRenderer コンポーネントの実装
  - `components/mdx/MermaidRenderer.tsx` を Client Component として作成
  - Mermaid.js を動的にロード（遅延読み込み）
  - ダークモード/ライトモードに応じてテーマを切り替え
  - エラーハンドリングとローディング状態の表示
  - _Requirements: 7.1, 7.3_

- [x] 10. ダッシュボードページの実装
- [x] 10.1 ダッシュボードページの実装
  - `app/dashboard/page.tsx` を Server Component として作成
  - ProgressService から進捗サマリーを取得
  - ContentService からコース一覧と推奨レッスンを取得
  - 進捗サマリー表示コンポーネントを実装（完了率、学習時間、達成項目）
  - 推奨コンテンツカードコンポーネントを実装
  - コース一覧コンポーネントを実装（各コースの進捗状況を表示）
  - エラーハンドリングと空状態の表示を実装
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 11. コース・レッスンページの実装
- [x] 11.1 コース詳細ページの実装
  - `app/courses/[courseId]/page.tsx` を Server Component として作成
  - ContentService に `getCourseWithSectionsAndLessons()` メソッドを追加
  - ContentService からコース情報とセクション・レッスン一覧を取得
  - ProgressService から各レッスンの完了ステータスを取得
  - コース概要表示コンポーネントを実装
  - セクション・レッスン一覧コンポーネントを実装（完了/未完了ステータスを表示）
  - ダッシュボードへの戻るリンクを実装
  - _Requirements: 4.3, 6.3_

- [x] 11.2 レッスンページの実装
  - `app/courses/[courseId]/sections/[sectionId]/lessons/[lessonId]/page.tsx` を Server Component として作成
  - ContentService からレッスンコンテンツとメタデータを取得
  - MDXSerializer で MDX をシリアライズ
  - MDXRenderer にシリアライズ済み MDX を渡してレンダリング
  - 前後レッスンへのナビゲーションリンクを実装（セクション間も考慮）
  - レッスン完了ボタンを実装（Server Action で ProgressService を呼び出し）
  - 完了済みレッスンの表示を実装
  - _Requirements: 4.2, 4.4_

- [x] 12. Claude API 統合サービスの実装
- [x] 12.1 ClaudeService の実装
  - `lib/services/claude.ts` に `ClaudeService` インターフェースを実装
  - `streamResponse()` メソッドを実装（Anthropic SDK を使用）
  - ストリーミング応答を `ReadableStream` として返す
  - レッスンコンテキストをプロンプトに組み込むロジックを実装（システムプロンプトに追加）
  - エラーハンドリングを実装（API キー検証、メッセージ検証、ストリーミングエラー処理）
  - 環境変数から API キーを取得（サーバーサイドのみ）
  - ストリームキャンセル時のクリーンアップ処理を実装
  - _Requirements: 5.1, 5.4, 10.3_

- [ ] 13. AI チャット会話サービスの実装
- [x] 13.1 ChatService の実装
  - `lib/services/chat.ts` に `ChatService` インターフェースを実装
  - `saveConversation()` メソッドを実装（`chat_conversations` テーブルに挿入）
  - `saveMessage()` メソッドを実装（`chat_messages` テーブルに挿入）
  - `getConversationHistory()` メソッドを実装（会話履歴を取得）
  - エラーハンドリングを実装
  - _Requirements: 5.3_

- [ ] 14. AI チャット API エンドポイントの実装
- [x] 14.1 ChatRouteHandler の実装
  - `app/api/chat/stream/route.ts` を Route Handler として作成
  - POST リクエストを受け取り、リクエストボディを検証
  - 認証チェックを実装（Supabase クライアントでユーザー認証）
  - ContentService からレッスンコンテキストを取得（`lessonId` が指定されている場合）
  - ChatService から会話履歴を取得
  - ClaudeService を呼び出してストリーミング応答を生成
  - `ReadableStream` または Server-Sent Events (SSE) でストリームを返す
  - エラーハンドリングを実装（適切な HTTP ステータスコードを返す）
  - ChatService で会話履歴を保存
  - _Requirements: 5.1, 5.4, 5.5, 10.3_

- [ ] 15. AI チャット UI の実装
- [x] 15.1 ChatUI コンポーネントの実装
  - `components/chat/ChatUI.tsx` を Client Component として作成
  - チャットインターフェースを実装（メッセージ表示エリア、入力フィールド、送信ボタン）
  - `fetch` で `/api/chat/stream` に接続し、`ReadableStream` を処理
  - ストリーミングテキストをリアルタイムに表示
  - 会話履歴のローカル状態管理を実装
  - エラーメッセージの日本語表示と再試行オプションを実装
  - ローディング状態の表示を実装
  - _Requirements: 5.2, 5.5, 9.4_

- [ ] 16. レッスンページへの AI チャット統合
- [x] 16.1 レッスンページに AI チャット UI を統合
  - レッスンページに ChatUI コンポーネントを追加
  - 現在のレッスン ID を ChatUI に渡す
  - ChatUI が `/api/chat/stream` に `lessonId` を送信するように実装
  - _Requirements: 5.4_

- [x] 17. UI/UX 基盤の実装
- [x] 17.1 テーマプロバイダーの実装
  - `components/theme/ThemeProvider.tsx` を Client Component として作成
  - Tailwind CSS v4 のダークモード/ライトモード切り替えを実装
  - CSS 変数によるテーマ管理を実装
  - ユーザーの設定を localStorage に保存
  - `components/theme/ThemeToggle.tsx` でテーマ切り替えUIを実装
  - _Requirements: 8.2_

- [x] 17.2 日本語フォントの設定
  - Next.js の `next/font/google` を使用して Noto Sans JP を読み込み
  - `app/layout.tsx` でフォントを適用
  - `app/globals.css` でフォント変数を設定
  - 日本語テキストの可読性を確保
  - _Requirements: 8.3_

- [x] 17.3 レスポンシブレイアウトの実装
  - すべての UI コンポーネントに Tailwind CSS のレスポンシブクラスを適用
  - モバイル（375px 以上）・タブレット・デスクトップで適切にレイアウトを調整
  - ブレークポイントに基づいたレイアウト変更を実装
  - ダッシュボード、レッスンページ、コースページ、ChatUI をレスポンシブ対応
  - _Requirements: 8.1_

- [x] 17.4 Framer Motion アニメーションの実装
  - `components/animations/PageTransition.tsx` でページ遷移アニメーションを実装
  - `components/animations/InteractiveElements.tsx` でインタラクティブ要素のアニメーションを実装
  - コンテンツ読み込み時にフェードイン・スライドアップアニメーションを適用
  - インタラクティブ要素にホバー・クリックアニメーションを追加
  - ダッシュボード、レッスンページにアニメーションを統合
  - _Requirements: 8.4_

- [x] 17.5 ローディングインジケーターの実装
  - `app/loading.tsx` を拡張（既存の実装を改善）
  - `components/ui/LoadingSpinner.tsx` で再利用可能なローディングコンポーネントを実装
  - コンテンツ読み込み中のローディング表示を実装
  - レスポンシブ対応のローディングUIを実装
  - _Requirements: 8.5_

- [x] 18. エラーハンドリングの実装
- [x] 18.1 エラーバウンダリの実装
  - `app/error.tsx` を拡張（既存の実装を改善）
  - ランタイムエラーをキャッチし、エラーメッセージと再試行ボタンを表示
  - 日本語エラーメッセージを実装
  - Framer Motion によるアニメーションを追加
  - エラーID表示とダッシュボードへのリンクを追加
  - _Requirements: 9.1, 9.4_

- [x] 18.2 404 ページの実装
  - `app/not-found.tsx` を拡張（既存の実装を改善）
  - 存在しないページへのアクセス時に 404 ページを表示
  - ナビゲーションヘルプを提供（ダッシュボード・コース一覧へのリンク）
  - Framer Motion によるアニメーションを追加
  - _Requirements: 9.2_

- [x] 18.3 オフライン状態通知の実装
  - `hooks/useNetworkStatus.ts` を実装（ネットワーク状態を検出）
  - `components/ui/NetworkStatus.tsx` を実装（通知コンポーネント）
  - オフライン時にユーザーに通知を表示（赤色のバナー）
  - オンライン復帰時に通知を非表示（緑色の成功メッセージを3秒間表示）
  - `app/layout.tsx` に統合してアプリ全体で動作
  - _Requirements: 9.3_

- [x] 19. パフォーマンス最適化の実装
- [x] 19.1 Server Component 優先設計の確認と最適化
  - すべてのページが Server Component をデフォルトとして使用していることを確認
  - Client Component は必要最小限に限定（UIインタラクション、アニメーション、チャットなど）
  - バンドルサイズを確認し、不要なクライアントコードを削減（適切に最小限に限定されていることを確認）
  - _Requirements: 10.1_

- [x] 19.2 静的生成と ISR の実装
  - コース一覧・レッスンメタデータに ISR を適用（`unstable_cache`を使用して60秒間キャッシュ）
  - 適切な `revalidate` 値を設定（ページレベルで60秒）
  - `ContentService`のメソッド（`listCourses`, `getCourse`, `getLesson`, `getCourseWithSectionsAndLessons`）にキャッシュを追加
  - コース詳細ページとレッスンページに`revalidate = 60`を設定
  - ダッシュボードページにも`revalidate = 60`を設定（メタデータのみキャッシュ、ユーザー固有データはキャッシュされない）
  - _Requirements: 10.4_

- [x] 20. CI/CD パイプラインの確認と拡張
- [x] 20.1 CI パイプラインの確認
  - `.github/workflows/ci.yml` を確認し、lint・型チェック・ビルドが正常に動作することを確認
  - 必要に応じて設定を調整
  - lint、type-check、buildを並列実行可能な別ジョブに分離
  - Next.jsビルドキャッシュを追加
  - 環境変数の設定を追加（ビルド時に必要）
  - _Requirements: 10.5_

- [x] 20.2 E2E テストパイプラインの確認
  - `.github/workflows/e2e.yml` を確認し、Playwright E2E テストが正常に動作することを確認
  - 必要に応じて設定を調整
  - 重複したsetup-nodeステップを削除
  - 環境変数の設定を追加（テスト実行時に必要）
  - _Requirements: 10.5_

- [ ] 21. 統合テストの実装
- [ ] 21.1 認証フローの統合テスト
  - サインアップ → ログイン → ダッシュボードのフローをテスト
  - Supabase Auth 統合をテスト
  - _Requirements: 1.1, 1.2_

- [ ] 21.2 レッスン完了フローの統合テスト
  - レッスン表示 → 完了記録 → 進捗更新のフローをテスト
  - Supabase DB 統合をテスト
  - _Requirements: 4.4, 6.1_

- [ ] 21.3 AI チャットフローの統合テスト
  - 質問送信 → ストリーミング応答 → 履歴保存のフローをテスト（Claude API はモック）
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 22. E2E テストの実装
- [ ] 22.1 ログインフローの E2E テスト
  - Playwright でログインフローをテスト（メール・パスワード入力 → ダッシュボード表示）
  - _Requirements: 1.2_

- [ ] 22.2 オンボーディングフローの E2E テスト
  - Playwright でオンボーディングフローをテスト（初回ログイン → オンボーディング完了 → ダッシュボード）
  - _Requirements: 2.1, 2.2_

- [ ] 22.3 レッスン閲覧フローの E2E テスト
  - Playwright でレッスン閲覧フローをテスト（コース選択 → レッスン表示 → MDX レンダリング → 完了記録）
  - _Requirements: 4.2, 4.4_

- [ ] 22.4 AI チャットフローの E2E テスト
  - Playwright で AI チャットフローをテスト（質問入力 → ストリーミング表示 → 履歴表示）
  - _Requirements: 5.2, 5.3_
