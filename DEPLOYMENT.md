# デプロイメントガイド

本番環境へのデプロイ手順とチェックリストです。

## 前提条件

- [ ] Node.js 20以上がインストールされていること
- [ ] Supabaseプロジェクトが作成されていること
- [ ] Anthropic APIキーが取得されていること
- [ ] Vercelアカウントが作成されていること（推奨）

## 環境変数の設定

本番環境で必要な環境変数を設定してください。

### 必須環境変数

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Anthropic Claude API
ANTHROPIC_API_KEY=your-api-key

# サイトURL（本番環境のURL）
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### オプション環境変数

```bash
# 認証を無効化する場合（開発・テスト用 - 本番環境では使用しない）
DISABLE_AUTH=false

# 管理者バイパスキー（管理者がログインなしでアクセスする場合）
# 使用方法: URLに ?admin_key=your-secret-key を追加、または x-admin-bypass-key ヘッダーを設定
ADMIN_BYPASS_KEY=your-secret-admin-key
```

**管理者バイパスの使用方法:**
- URLパラメータ: `https://your-app.vercel.app/dashboard?admin_key=your-secret-key`
- または、HTTPヘッダー: `x-admin-bypass-key: your-secret-key`

**セキュリティ注意事項:**
- `ADMIN_BYPASS_KEY`は強力なランダムな文字列に設定してください
- 本番環境で使用する場合は、HTTPSを使用し、キーを適切に管理してください
- 管理者バイパスは認証をスキップしますが、データベースのRLSポリシーは引き続き適用されます

## データベースのセットアップ

### 1. マイグレーションの適用

Supabaseダッシュボードで以下のマイグレーションファイルを実行してください：

1. `supabase/migrations/20260208000001_create_profiles_table.sql`
2. `supabase/migrations/20260208000002_create_courses_sections_lessons_tables.sql`
3. `supabase/migrations/20260208000003_create_progress_tables.sql`
4. `supabase/migrations/20260208000004_create_chat_tables.sql`
5. `supabase/migrations/20260208000005_update_rls_for_public_access.sql`（認証無効化時）

### 2. サンプルコースデータの登録

SupabaseダッシュボードのSQL Editorで以下を実行：

```sql
-- scripts/seed-courses.sql の内容を実行
```

または、Supabaseダッシュボード → SQL Editor → `scripts/seed-courses.sql` の内容をコピー＆ペーストして実行

### 3. RLSポリシーの確認

認証を無効化している場合、以下のRLSポリシーが適用されていることを確認：

- `Public can view courses` - 匿名ユーザーもコースを閲覧可能
- `Public can view sections` - 匿名ユーザーもセクションを閲覧可能
- `Public can view lessons` - 匿名ユーザーもレッスンを閲覧可能

## Vercelへのデプロイ

### 1. Vercelプロジェクトの作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. 「Add New Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定を確認

### 2. 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定：

1. Project Settings → Environment Variables
2. 以下の必須環境変数を追加：

   **必須環境変数（本番環境で必要）:**
   - `NEXT_PUBLIC_SUPABASE_URL` - SupabaseプロジェクトのURL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabaseの匿名キー（公開キー）
   - `ANTHROPIC_API_KEY` - Anthropic Claude APIキー
   - `NEXT_PUBLIC_SITE_URL` - 本番環境のサイトURL（例: `https://your-domain.vercel.app`）

3. 各環境変数を本番環境（Production）に適用
4. 必要に応じてPreview環境やDevelopment環境にも設定

### 3. ビルド設定

Vercelは自動的にNext.jsを検出しますが、必要に応じて以下を確認：

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `.next`（デフォルト）
- **Install Command**: `npm install --legacy-peer-deps`（`vercel.json`で設定済み）

### 4. デプロイ

1. `main`ブランチにプッシュすると自動デプロイされます
2. または、Vercelダッシュボードから手動デプロイ

```bash
git push origin main
```

### 5. ドメインの設定

#### デフォルトドメイン

Vercelは自動的に`your-project-name.vercel.app`というデフォルトドメインを割り当てます。このドメインは変更できませんが、カスタムドメインを追加して優先的に使用できます。

#### カスタムドメインの追加

1. Vercelダッシュボード → Project Settings → Domains
2. 「Add Domain」をクリック
3. カスタムドメインを入力（例: `kz-code.com`）
4. DNS設定の指示に従って、ドメインプロバイダーでDNSレコードを設定
   - **Aレコード**: VercelのIPアドレスを指す
   - **CNAMEレコード**: `cname.vercel-dns.com`を指す（推奨）
5. DNS設定の反映を待つ（通常数分〜数時間）
6. カスタムドメインが有効になると、自動的にHTTPS証明書が発行されます

#### ドメインの変更・削除

- **カスタムドメインの削除**: Project Settings → Domains → ドメインの横の「⋯」→ Remove
- **デフォルトドメインの変更**: できません（プロジェクト名を変更する必要があります）
- **新しいカスタムドメインの追加**: いつでも追加可能

#### 環境変数の更新

カスタムドメインを追加した場合、`NEXT_PUBLIC_SITE_URL`環境変数を新しいドメインに更新してください：

```
NEXT_PUBLIC_SITE_URL=https://your-custom-domain.com
```

## デプロイ前チェックリスト

### コード品質

- [x] `npm run type-check` が成功する ✅
- [ ] `npm run lint` が成功する（警告は許容）
- [ ] `npm run build` が成功する（ローカルではGoogle Fontsのネットワークアクセスが必要）
- [ ] テストがすべて成功する（`npm test`）

**注意**: ローカルでのビルドはGoogle Fontsへのネットワークアクセスが必要ですが、Vercelでは自動的に処理されます。

### 環境変数

以下の環境変数をVercelダッシュボードで設定してください：

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - SupabaseプロジェクトURL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名キー
- [ ] `ANTHROPIC_API_KEY` - Anthropic Claude APIキー
- [ ] `NEXT_PUBLIC_SITE_URL` - 本番環境のURL（例: `https://your-app.vercel.app`）

**オプション**:
- [ ] `DISABLE_AUTH` - 認証を無効化する場合（デフォルト: `false`）

### データベース

- [ ] Supabaseマイグレーションが適用されている
- [ ] RLS（Row Level Security）ポリシーが設定されている
- [ ] 必要なテーブルが作成されている
- [ ] **サンプルコースデータが登録されている**（`scripts/seed-courses.sql`を実行）

### セキュリティ

- [ ] 環境変数に機密情報が含まれていない（`.env.local`はコミットされていない）
- [ ] SupabaseのRLSポリシーが適切に設定されている
- [ ] APIキーが適切に保護されている

### パフォーマンス

- [ ] 画像が最適化されている
- [ ] 不要な依存関係がない
- [ ] バンドルサイズが適切

## デプロイ後の確認

### 基本動作確認

- [ ] ホームページが表示される
- [ ] ログインページが表示される（認証が有効な場合）
- [ ] サインアップが動作する（認証が有効な場合）
- [ ] ダッシュボードが表示される
- [ ] **コース一覧が表示される（コースデータが登録されている）**
- [ ] レッスンが表示される

### 機能確認

- [ ] 認証が正常に動作する（認証が有効な場合）
- [ ] レッスン完了機能が動作する
- [ ] AIチャットが動作する
- [ ] 進捗が正しく記録される（認証が有効な場合）

### パフォーマンス確認

- [ ] ページ読み込み速度が適切
- [ ] 画像が正しく読み込まれる
- [ ] アニメーションがスムーズに動作する

### セキュリティ確認

- [ ] HTTPSが有効になっている
- [ ] 環境変数が正しく設定されている（機密情報が公開されていない）
- [ ] 認証が正常に動作している（`DISABLE_AUTH`が設定されていない）

#### 確認方法

**1. HTTPSの確認**
- ブラウザのアドレスバーで🔒アイコンを確認
- URLが`https://`で始まっていることを確認
- ブラウザの開発者ツール（F12）→ Securityタブで証明書を確認

**2. 環境変数の確認**
- Vercelダッシュボード → Project Settings → Environment Variables
- 以下の環境変数が設定されていることを確認：
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `ANTHROPIC_API_KEY`
  - `NEXT_PUBLIC_SITE_URL`
- `DISABLE_AUTH`が設定されていない、または`false`であることを確認
- ブラウザの開発者ツール（F12）→ Consoleで環境変数が公開されていないことを確認
  - `NEXT_PUBLIC_*`以外の環境変数はブラウザに公開されないはずです

**3. 認証の確認**
- 未認証でダッシュボードにアクセス → `/login`にリダイレクトされることを確認
- ログインページで正しい認証情報でログインできることを確認
- ログアウト後、再度ダッシュボードにアクセスできないことを確認
- Vercelダッシュボードで`DISABLE_AUTH`環境変数が設定されていないことを確認

## 管理者バイパス機能（ADMIN_BYPASS_KEY）の詳細

### 概要

`ADMIN_BYPASS_KEY`は、管理者がログインせずにアプリケーションにアクセスできる機能です。通常の認証フローをスキップして、直接ダッシュボードやコース、レッスンページにアクセスできます。

### 設定方法

1. **環境変数の設定**
   - Vercelダッシュボード → Settings → Environment Variables
   - **Key**: `ADMIN_BYPASS_KEY`
   - **Value**: 強力なランダム文字列（後述の生成方法を参照）
   - **Environment**: Production のみにチェック（本番環境でのみ使用）

2. **シークレットキーの生成**
   
   **方法1: OpenSSLを使用（推奨）**
   ```bash
   openssl rand -hex 32
   ```
   例: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
   
   **方法2: Node.jsを使用**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
   **方法3: オンラインツール**
   - [Random.org](https://www.random.org/strings/) などのランダム文字列生成ツールを使用
   - 64文字以上のランダムな文字列を生成

### 使用方法

#### 方法1: URLパラメータ（簡単）

ブラウザのアドレスバーに以下のように追加：

```
https://your-app.vercel.app/dashboard?admin_key=your-secret-key
https://your-app.vercel.app/courses/course-id?admin_key=your-secret-key
```

**例:**
```
https://kz-code.vercel.app/dashboard?admin_key=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

#### 方法2: HTTPヘッダー（APIリクエスト用）

APIリクエストやcurlコマンドで使用：

```bash
curl -H "x-admin-bypass-key: your-secret-key" https://your-app.vercel.app/dashboard
```

### 動作の仕組み

1. **ミドルウェアでのチェック**
   - リクエストが来ると、ミドルウェアが`ADMIN_BYPASS_KEY`をチェック
   - URLパラメータ（`?admin_key=...`）またはHTTPヘッダー（`x-admin-bypass-key`）からキーを取得
   - 環境変数の`ADMIN_BYPASS_KEY`と一致する場合、認証をスキップ

2. **ページコンポーネントでの処理**
   - 管理者バイパスが有効な場合、ダミーユーザーIDでアクセス
   - 通常の認証チェックをスキップ
   - データベースのRLSポリシーは引き続き適用されるため、データアクセスは制限される可能性があります

### セキュリティ注意事項

⚠️ **重要なセキュリティ考慮事項:**

1. **強力なキーを使用**
   - 64文字以上のランダムな文字列を使用
   - 推測しにくい文字列を生成

2. **HTTPSの使用**
   - 本番環境では必ずHTTPSを使用
   - URLパラメータはブラウザの履歴やログに残る可能性があるため注意

3. **キーの管理**
   - キーをコードにコミットしない
   - キーを共有する場合は安全な方法を使用（例: 1Password、LastPass）
   - 定期的にキーをローテーション（変更）

4. **アクセスログの確認**
   - Vercel Logsで管理者バイパスキーの使用を監視
   - 不正なアクセスがないか定期的に確認

5. **データベースの保護**
   - 管理者バイパスは認証をスキップしますが、SupabaseのRLSポリシーは引き続き適用されます
   - データベースレベルでのアクセス制御が重要です

### 使用例

**シナリオ1: 緊急時のアクセス**
```
問題が発生し、通常のログインができない場合
→ 管理者バイパスキーを使用してダッシュボードにアクセス
```

**シナリオ2: デモ・プレゼンテーション**
```
クライアントにデモを行う際、ログイン手順をスキップ
→ 管理者バイパスキーで直接アクセス
```

**シナリオ3: 開発・テスト**
```
開発環境で認証をスキップしてテスト
→ 管理者バイパスキーでアクセス
```

### トラブルシューティング

**Q: 管理者バイパスキーが動作しない**
- 環境変数が正しく設定されているか確認
- キーが完全に一致しているか確認（スペースや改行がないか）
- 再デプロイが必要な場合があります

**Q: セキュリティが心配**
- URLパラメータではなく、HTTPヘッダーを使用することを検討
- 定期的にキーをローテーション
- アクセスログを監視

**Q: データベースにアクセスできない**
- RLSポリシーが設定されている場合、ダミーユーザーIDではアクセスできない可能性があります
- 必要に応じて、管理者用のRLSポリシーを設定

## トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルドをテスト
npm run build

# エラーログを確認
npm run build 2>&1 | tee build.log
```

### 環境変数エラー

- Vercelダッシュボードで環境変数が正しく設定されているか確認
- 環境変数名にタイポがないか確認
- 本番環境（Production）に適用されているか確認

### データベース接続エラー

- Supabaseプロジェクトがアクティブか確認
- RLSポリシーが適切に設定されているか確認
- ネットワーク接続を確認

### 404エラー

- ルーティングが正しく設定されているか確認
- `next.config.ts`の設定を確認

### コースが表示されない

1. **データベースにコースデータが登録されているか確認**
   - Supabaseダッシュボード → Table Editor → `courses`テーブルを確認
   - データが存在しない場合、`scripts/seed-courses.sql`を実行

2. **RLSポリシーを確認**
   - Supabaseダッシュボード → Authentication → Policies
   - `Public can view courses`ポリシーが有効か確認
   - 認証を無効化している場合、`20260208000005_update_rls_for_public_access.sql`を実行

3. **キャッシュをクリア**
   - Vercelダッシュボードから再デプロイを実行
   - ブラウザのキャッシュをクリア

## ロールバック

問題が発生した場合、Vercelダッシュボードから以前のデプロイにロールバックできます：

1. Vercelダッシュボード → Deployments
2. ロールバックしたいデプロイを選択
3. 「⋯」メニュー → 「Promote to Production」

## 継続的デプロイ

`main`ブランチへのプッシュで自動デプロイされます。開発ブランチのデプロイはPreview環境として作成されます。

## モニタリング

デプロイ後、以下をモニタリングしてください：

- Vercel Analytics（パフォーマンス）
- Supabase Dashboard（データベース）
- エラーログ（Vercel Logs）

## サポート

問題が発生した場合：

1. Vercel Logsを確認
2. Supabase Logsを確認
3. GitHub Issuesで報告
