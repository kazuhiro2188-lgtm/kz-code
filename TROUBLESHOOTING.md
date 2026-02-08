# レッスンページアクセス問題のトラブルシューティング

## 問題
レッスンページにアクセスできない

## 確認手順

### 1. ブラウザのコンソールでエラーを確認
1. F12キーで開発者ツールを開く
2. Consoleタブでエラーを確認
3. NetworkタブでHTTPステータスコードを確認（404、500など）

### 2. サーバーログを確認
開発サーバーのターミナルでエラーメッセージを確認

### 3. URLの確認
正しいURL形式：
```
/courses/{courseId}/sections/{sectionId}/lessons/{lessonId}
```

例：
```
/courses/course-infrastructure-basics/sections/section-infrastructure-fundamentals/lessons/lesson-infrastructure-overview
```

### 4. データの確認

#### コースID
- `course-infrastructure-basics`

#### セクションID
- `section-infrastructure-fundamentals`

#### レッスンID
- `lesson-infrastructure-overview`

### 5. よくある原因と解決策

#### 原因1: レッスンが見つからない（404エラー）
**症状**: `notFound()`が呼ばれる

**確認方法**:
- `lib/data/courses.ts`でレッスンIDが正しく定義されているか確認
- `getLesson`関数が正しく動作しているか確認

**解決策**:
- レッスンID、セクションID、コースIDの組み合わせが正しいか確認
- `lib/data/courses.ts`のレッスンデータを確認

#### 原因2: MDXファイルが見つからない
**症状**: エラーメッセージ「MDXファイルの読み込みに失敗しました」

**確認方法**:
- `content/lessons/course1/section1/lesson1.mdx`が存在するか確認
- `contentPath`が正しいか確認

**解決策**:
- MDXファイルが存在することを確認
- `contentPath`が正しい形式か確認（例: `course1/section1/lesson1.mdx`）

#### 原因3: ルーティングの問題
**症状**: 404エラー

**確認方法**:
- Next.jsのルーティング構造を確認
- `app/courses/[courseId]/sections/[sectionId]/lessons/[lessonId]/page.tsx`が存在するか確認

**解決策**:
- ファイル構造が正しいか確認
- Next.jsのルーティング規則に従っているか確認

### 6. デバッグ方法

#### デバッグログを追加
`app/courses/[courseId]/sections/[sectionId]/lessons/[lessonId]/page.tsx`に以下を追加：

```typescript
console.log("CourseId:", courseId);
console.log("SectionId:", sectionId);
console.log("LessonId:", lessonId);
console.log("LessonResult:", lessonResult);
```

#### レッスンデータの確認
`lib/data/courses.ts`で以下を確認：

```typescript
// レッスンが正しく定義されているか確認
const lesson = getLesson(
  "course-infrastructure-basics",
  "section-infrastructure-fundamentals",
  "lesson-infrastructure-overview"
);
console.log("Lesson:", lesson);
```

## 次のステップ

1. ブラウザのコンソールとサーバーログでエラーメッセージを確認
2. エラーメッセージの内容を共有
3. 必要に応じてデバッグログを追加して詳細を確認
