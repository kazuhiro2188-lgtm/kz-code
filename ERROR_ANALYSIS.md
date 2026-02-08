# エラー原因分析と改善点

## 発生したエラー

```
Route /dashboard used `cookies()` inside a function cached with `unstable_cache()`.
Accessing Dynamic data sources inside a cache scope is not supported.
```

## 根本原因

### 1. **設計思想の欠如：キャッシュと動的データの混在**

**問題点:**
- `unstable_cache()`は静的データやユーザー非依存データのキャッシュに使用すべき
- `cookies()`は動的データ（認証状態、セッション）にアクセスするため、キャッシュ内では使用不可
- `createServerSupabaseClient()`が内部で`cookies()`を呼び出すため、`unstable_cache()`内で使用できない

**なぜ起きたか:**
- Next.jsの`unstable_cache()`の制約を理解せずに実装
- 「パフォーマンス向上のためキャッシュを使う」という表面的な判断
- データの性質（静的 vs 動的）を考慮していない

### 2. **認証無効化時の設計不備**

**問題点:**
- 認証を無効化した後も、`progressService`がSupabaseクライアントを使用しようとしていた
- 早期リターンで回避したが、到達不能コードが残存（TypeScriptエラー14件）
- 認証状態の変更に対する影響範囲の分析が不十分

**なぜ起きたか:**
- 認証無効化が後付けの変更だった
- 影響範囲の洗い出しが不十分
- リファクタリング時のテスト不足

### 3. **コード品質の問題**

**問題点:**
- 早期リターン後の到達不能コードが残存
- エラーハンドリングが不完全（`error`が`null`の可能性を無視）
- 型安全性が損なわれている

**なぜ起きたか:**
- 緊急対応で早期リターンを追加したが、後続コードの削除を忘れた
- TypeScriptの厳格な型チェックを無視
- コードレビュー不足

---

## 改善点（厳格な基準）

### 1. **アーキテクチャ設計の徹底**

#### 改善策A: データソースの明確な分類

```typescript
// ❌ 悪い例：動的データをキャッシュ内で使用
return unstable_cache(
  async () => {
    const supabase = await createServerSupabaseClient(); // cookies()を使用
    // ...
  }
)();

// ✅ 良い例：静的データのみキャッシュ
return unstable_cache(
  async () => {
    return staticCourses; // 静的データのみ
  },
  ["courses-list"],
  { revalidate: 60 }
)();

// ✅ 良い例：動的データはキャッシュ外で処理
async function getProgress(userId: string) {
  // キャッシュを使わない
  const supabase = await createServerSupabaseClient();
  // ...
}
```

**実装方針:**
- 静的データ（コース一覧、レッスン内容）→ `unstable_cache()`使用可
- 動的データ（ユーザー進捗、認証状態）→ `unstable_cache()`使用不可
- この分類をコードコメントで明記

#### 改善策B: サービス層の責務分離

```typescript
// ✅ 良い設計：静的データサービスと動的データサービスを分離
class StaticContentService {
  // 静的データのみ、キャッシュ可能
  async listCourses() { /* ... */ }
}

class UserProgressService {
  // 動的データ、キャッシュ不可
  async getProgress(userId: string) { /* ... */ }
}
```

### 2. **認証状態変更時の影響範囲管理**

#### 改善策A: 影響範囲マトリクス

認証を無効化する際、以下のマトリクスで影響範囲を洗い出す：

| コンポーネント | 認証依存 | 変更必要 | テスト必要 |
|---|---|---|---|
| `ContentService` | ❌ | ✅ | ✅ |
| `ProgressService` | ✅ | ✅ | ✅ |
| `ChatService` | ✅ | ✅ | ✅ |
| `UserProfileService` | ✅ | ✅ | ✅ |

#### 改善策B: 機能フラグの導入

```typescript
// ✅ 良い設計：機能フラグで制御
const AUTH_ENABLED = process.env.ENABLE_AUTH === "true";

async function getProgress(userId: string) {
  if (!AUTH_ENABLED) {
    return { success: true, data: defaultProgress };
  }
  // 認証有効時の処理
}
```

### 3. **コード品質の徹底**

#### 改善策A: 到達不能コードの削除

```typescript
// ❌ 悪い例：早期リターン後のコードが残存
async function getProgress() {
  return { success: true, data: 0 }; // 早期リターン
  try {
    // 到達不能コード
  } catch (error) {
    // 到達不能コード
  }
}

// ✅ 良い例：早期リターンの場合は後続コードを削除
async function getProgress() {
  if (!AUTH_ENABLED) {
    return { success: true, data: 0 };
  }
  // 認証有効時の処理のみ
  try {
    // ...
  } catch (error) {
    // ...
  }
}
```

#### 改善策B: TypeScript厳格モードの徹底

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### 改善策C: ESLintルールの追加

```json
// .eslintrc.json
{
  "rules": {
    "no-unreachable": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### 4. **テスト戦略の確立**

#### 改善策A: 単体テストの必須化

```typescript
// ✅ 良い例：各サービスメソッドにテストを書く
describe("ProgressService", () => {
  describe("when auth is disabled", () => {
    it("should return default progress", async () => {
      const result = await progressService.getProgressSummary(userId);
      expect(result.data.progressPercentage).toBe(0);
    });
  });
});
```

#### 改善策B: 統合テストの追加

- 認証無効化時のエンドツーエンドテスト
- `unstable_cache()`と`cookies()`の組み合わせテスト

### 5. **ドキュメント整備**

#### 改善策A: アーキテクチャ決定記録（ADR）

```
# ADR-001: 認証無効化時のデータ取得戦略

## 決定
認証無効化時は、静的データのみを使用し、動的データはデフォルト値を返す。

## 理由
- `unstable_cache()`と`cookies()`の制約
- パフォーマンスと機能のバランス

## 影響範囲
- ContentService: 静的データのみに変更済み
- ProgressService: デフォルト値返却に変更必要
```

---

## 即座に実施すべき修正

### 優先度1（緊急）✅ 完了

1. **到達不能コードの削除** ✅
   - `lib/services/progress.ts`の早期リターン後のコードを削除
   - TypeScriptエラー4件を解消
   - 修正対象メソッド：
     - `getProgressSummary()`: 到達不能コード削除
     - `calculateProgress()`: 到達不能コード削除
     - `completeLesson()`: 到達不能コード削除
     - `getLessonStatus()`: 到達不能コード削除
     - `saveHistory()`: 到達不能コード削除

2. **型安全性の確保** ✅
   - 早期リターンにより、`error`が`null`の可能性の問題を根本解決
   - 到達不能コード削除により、型エラーを完全解消

### 優先度2（重要）

3. **サービス層の再設計**
   - 静的データサービスと動的データサービスを分離
   - 認証状態に応じた分岐を明確化
   - **現状**: 認証無効化時は早期リターンで対応。将来的には機能フラグ導入を推奨

4. **テストの追加**
   - 認証無効化時のテストケース追加
   - `unstable_cache()`使用箇所のテスト
   - **現状**: テスト未実装。CI/CDパイプラインに追加が必要

5. **未使用インポートの整理** ✅
   - `createServerSupabaseClient`のインポートをコメントアウト
   - 将来の認証再有効化に備えてコメントで説明を追加

### 優先度3（中長期）

5. **アーキテクチャドキュメントの整備**
   - データソース分類の明確化
   - キャッシュ戦略の文書化

---

## 再発防止策

1. **コードレビューチェックリスト**
   - [ ] `unstable_cache()`内で`cookies()`を使用していないか
   - [ ] 早期リターン後の到達不能コードがないか
   - [ ] TypeScriptエラーが0件か
   - [ ] 認証状態変更時の影響範囲を確認したか

2. **CI/CDパイプラインの強化**
   - TypeScriptの厳格チェックを必須化
   - ESLintの`no-unreachable`ルールを有効化
   - テストカバレッジ80%以上を必須化

3. **定期的なアーキテクチャレビュー**
   - 四半期ごとにアーキテクチャ決定の見直し
   - 技術的負債の棚卸し
