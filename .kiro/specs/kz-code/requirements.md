# Requirements Document

## Introduction

KZ-Code は、AI駆動開発（AI-DLC）における基礎理論・設計原理を体系的に学ぶための日本語学習アプリケーションである。
開発者がAIと協働する上で必要な知識体系を、インタラクティブなコンテンツ・AIアシスタント・図解を通じて習得できる環境を提供する。

本要件は、Next.js 16 (App Router) + Supabase + Anthropic Claude API を技術基盤とし、
日本語ネイティブな学習体験を実現するための機能要件・非機能要件を定義する。

## Requirements

### Requirement 1: ユーザー認証
**Objective:** As a 学習者, I want アカウントを作成しログインできること, so that パーソナライズされた学習体験と進捗の永続化が得られる

#### Acceptance Criteria
1. When ユーザーがサインアップフォームにメールアドレスとパスワードを入力して送信した場合, the KZ-Code shall Supabase Auth を通じて新規アカウントを作成し、ダッシュボードまたはオンボーディングへリダイレクトする
2. When ユーザーがログインフォームに正しい認証情報を入力した場合, the KZ-Code shall 認証セッションを確立し `/dashboard` へリダイレクトする
3. When ユーザーがパスワードリセットをリクエストした場合, the KZ-Code shall 登録メールアドレスにリセットリンクを送信する
4. If 未認証ユーザーが保護されたページにアクセスした場合, then the KZ-Code shall `/login` ページへリダイレクトする
5. If 認証済みユーザーが認証ページ（`/login`, `/signup`, `/reset-password`）にアクセスした場合, then the KZ-Code shall `/dashboard` へリダイレクトする
6. While ユーザーセッションが有効な間, the KZ-Code shall ミドルウェアを通じてセッションを自動更新する

### Requirement 2: オンボーディング
**Objective:** As a 新規ユーザー, I want 初回ログイン時に学習目標や経験レベルを設定できること, so that 自分に合った学習体験が開始できる

#### Acceptance Criteria
1. When 新規ユーザーが初めてログインした場合, the KZ-Code shall オンボーディングフローを表示する
2. When ユーザーが学習目標・経験レベルを選択して完了した場合, the KZ-Code shall プロフィール情報を保存し `/dashboard` へリダイレクトする
3. While オンボーディングが未完了の間, the KZ-Code shall `/onboarding` ページへの案内を維持する

### Requirement 3: ダッシュボード
**Objective:** As a 学習者, I want 学習全体の進捗と次のアクションを一覧できること, so that 効率的に学習を継続できる

#### Acceptance Criteria
1. When 認証済みユーザーがダッシュボードにアクセスした場合, the KZ-Code shall 学習進捗サマリー（完了率・学習時間・達成項目）を表示する
2. When ユーザーがダッシュボードを表示した場合, the KZ-Code shall 推奨される次の学習コンテンツを提示する
3. The KZ-Code shall ダッシュボードにコース一覧とそれぞれの進捗状況を表示する

### Requirement 4: 学習コンテンツ配信
**Objective:** As a 学習者, I want AI駆動開発の基礎理論・設計原理を体系的に学べるコンテンツにアクセスできること, so that 段階的に知識を習得できる

#### Acceptance Criteria
1. The KZ-Code shall MDX 形式で記述された学習コンテンツをレンダリングし、リッチテキスト・コードブロック・インタラクティブ要素を表示する
2. When ユーザーがコース内のレッスンを選択した場合, the KZ-Code shall 該当レッスンのコンテンツを表示し、前後レッスンへのナビゲーションを提供する
3. The KZ-Code shall 学習コンテンツをコース > セクション > レッスンの階層構造で整理する
4. When ユーザーがレッスンを閲覧完了した場合, the KZ-Code shall 完了状態を記録し進捗を更新する
5. The KZ-Code shall すべての学習コンテンツを日本語で提供する

### Requirement 5: AI 学習アシスタント
**Objective:** As a 学習者, I want 学習中に AI に質問や相談ができること, so that 理解が深まり疑問をすぐに解消できる

#### Acceptance Criteria
1. When ユーザーが AI アシスタントに質問を送信した場合, the KZ-Code shall Anthropic Claude API を通じて学習コンテキストに基づいた回答を生成する
2. While AI が回答を生成している間, the KZ-Code shall ストリーミング表示でリアルタイムにレスポンスを表示する
3. The KZ-Code shall AI アシスタントの会話履歴を保持し、過去のやり取りを参照可能にする
4. When ユーザーが特定のレッスンページで AI アシスタントを利用した場合, the KZ-Code shall 現在のレッスン内容をコンテキストとして AI に提供する
5. If Claude API からエラーレスポンスが返された場合, then the KZ-Code shall ユーザーにわかりやすいエラーメッセージを表示し、再試行オプションを提供する

### Requirement 6: 学習進捗管理
**Objective:** As a 学習者, I want 学習の進捗を詳細に把握できること, so that 自分のペースで効果的に学習を進められる

#### Acceptance Criteria
1. When ユーザーがレッスンを完了した場合, the KZ-Code shall Supabase データベースに完了記録を保存する
2. The KZ-Code shall コースごとの進捗率（完了レッスン数 / 全レッスン数）を算出し表示する
3. When ユーザーがコース詳細ページにアクセスした場合, the KZ-Code shall 各レッスンの完了/未完了ステータスを表示する
4. The KZ-Code shall 学習履歴（最終学習日・累計学習時間など）をユーザープロフィールに関連付けて永続化する

### Requirement 7: 図解・ビジュアライゼーション
**Objective:** As a 学習者, I want 概念やプロセスを図解で視覚的に理解できること, so that 抽象的な概念の理解が促進される

#### Acceptance Criteria
1. The KZ-Code shall Mermaid.js を用いてフローチャート・シーケンス図・クラス図などをレンダリングする
2. When MDX コンテンツ内に Mermaid コードブロックが含まれる場合, the KZ-Code shall 自動的にダイアグラムとして描画する
3. The KZ-Code shall ダイアグラムをダークモード/ライトモードの両方で正しく表示する

### Requirement 8: UI/UX・レスポンシブデザイン
**Objective:** As a 学習者, I want どのデバイスでも快適に学習できること, so that 場所を選ばず学習を継続できる

#### Acceptance Criteria
1. The KZ-Code shall モバイル（375px 以上）・タブレット・デスクトップで適切にレイアウトを調整する
2. The KZ-Code shall Tailwind CSS v4 を用いたダークモード/ライトモードの切り替えをサポートする
3. The KZ-Code shall 日本語フォント（Noto Sans JP 等）を使用し、日本語テキストの可読性を確保する
4. When ページ遷移やコンテンツ読み込みが発生した場合, the KZ-Code shall Framer Motion によるスムーズなアニメーション/トランジションを適用する
5. While ページコンテンツがロード中の間, the KZ-Code shall ローディングインジケーターを表示する

### Requirement 9: エラーハンドリング
**Objective:** As a 学習者, I want エラー発生時にも適切な案内が表示されること, so that 学習が中断されず継続できる

#### Acceptance Criteria
1. If アプリケーション内でランタイムエラーが発生した場合, then the KZ-Code shall エラーバウンダリでキャッチし、エラーメッセージと再試行ボタンを表示する
2. If 存在しないページにアクセスした場合, then the KZ-Code shall 404 ページを表示する
3. If ネットワーク接続が失われた場合, then the KZ-Code shall ユーザーにオフライン状態を通知する
4. The KZ-Code shall すべてのエラーメッセージを日本語で表示する

### Requirement 10: パフォーマンス・セキュリティ
**Objective:** As a プロダクトオーナー, I want アプリケーションが高速かつ安全に動作すること, so that ユーザーに信頼性の高い学習体験を提供できる

#### Acceptance Criteria
1. The KZ-Code shall サーバーコンポーネントを優先使用し、クライアントバンドルサイズを最小化する
2. The KZ-Code shall Supabase RLS（Row Level Security）を有効化し、ユーザーデータへのアクセスを認証済みユーザー本人に限定する
3. The KZ-Code shall 環境変数で管理される API キー・シークレットをクライアントサイドに露出しない
4. The KZ-Code shall Lighthouse パフォーマンススコア 90 以上を維持する
5. While CI パイプライン実行中, the KZ-Code shall lint・型チェック・ビルド・E2E テストをすべてパスする

