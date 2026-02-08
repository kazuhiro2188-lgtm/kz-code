# Supabase Migrations

このディレクトリには Supabase データベースのマイグレーションファイルが含まれます。

## 📚 詳細ガイド

**マイグレーションの実行と動作確認の詳細な手順は [`MIGRATION_GUIDE.md`](../MIGRATION_GUIDE.md) を参照してください。**

## クイックスタート

### Supabase CLI を使用する場合（推奨）

```bash
# ローカル環境でマイグレーションを実行
supabase db reset

# または特定のマイグレーションを適用
supabase migration up
```

### Supabase Dashboard を使用する場合

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. SQL Editor を開く
4. マイグレーションファイルの内容をコピー＆ペーストして実行

## 動作確認

マイグレーション実行後、`verify_profiles_table.sql` を SQL Editor で実行して動作確認できます。

## マイグレーションファイルの命名規則

`YYYYMMDDHHMMSS_description.sql` 形式で命名してください。

例: `20260208000001_create_profiles_table.sql`

## 注意事項

- マイグレーションファイルは上から順に実行されます
- 既存のマイグレーションを変更しないでください（新しいマイグレーションを作成してください）
- RLS ポリシーは必ず有効化してください
