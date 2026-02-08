# メール通知を無効化する方法

コミット・プッシュ後のメール通知を無効化するには、以下の方法があります。

## 1. GitHubリポジトリの通知設定を変更（推奨）

GitHubのリポジトリ設定から通知を無効化できます：

1. GitHubリポジトリ（`https://github.com/kazuhiro2188-lgtm/kz-code`）にアクセス
2. 右上の「Settings」をクリック
3. 左サイドバーから「Notifications」を選択
4. 「Watch」設定を確認：
   - 「Not watching」を選択すると、すべての通知が無効化されます
   - 「Releases only」を選択すると、リリース時のみ通知されます
5. または、リポジトリページの右上の「Watch」ボタンをクリックして「Unwatch」を選択

## 2. GitHubアカウント全体の通知設定を変更

1. GitHubの右上のプロフィール画像をクリック
2. 「Settings」を選択
3. 左サイドバーから「Notifications」を選択
4. 「Email」セクションで、以下の設定を変更：
   - 「Email notifications」を「Off」に設定
   - または、特定のイベントのみ通知を受け取るように設定

## 3. ローカルのGit設定でメール送信を無効化（オプション）

ターミナルで以下のコマンドを実行：

```bash
# リポジトリローカルの設定
git config --local sendemail.enabled false

# または、グローバル設定（すべてのリポジトリに適用）
git config --global sendemail.enabled false
```

## 4. GitHub Actionsの通知を無効化（現在は設定されていません）

現在、GitHub Actionsのワークフロー（`.github/workflows/ci.yml`、`.github/workflows/e2e.yml`）にはメール通知の設定は含まれていません。

もしGitHub Actionsからメール通知を受け取りたい場合は、ワークフローファイルに通知設定を追加できます。

---

**注意**: メール通知は通常、GitHubのリポジトリ設定から送信されます。ローカルのGit設定を変更しても、GitHubからの通知は無効化されません。
