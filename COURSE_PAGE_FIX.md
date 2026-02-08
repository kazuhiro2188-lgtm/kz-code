# コースページのuseStateエラー修正

## 問題
`course-software-architecture-basics`ページで`useState`エラーが発生していました。

## 原因
`SectionLessonList`がClient Component（`"use client"`ディレクティブあり）なのに、Server Componentから直接インポートされていました。

## 修正内容

### app/courses/[courseId]/page.tsxの修正
`CourseOverview`と`SectionLessonList`を動的インポートに変更：

```typescript
// 修正前
import CourseOverview from "@/components/courses/CourseOverview";
import SectionLessonList from "@/components/courses/SectionLessonList";

// 修正後
const CourseOverview = dynamic(() => import("@/components/courses/CourseOverview"), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-pulse text-gray-400 dark:text-gray-600">コース概要を読み込み中...</div>
    </div>
  ),
});

const SectionLessonList = dynamic(() => import("@/components/courses/SectionLessonList"), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-pulse text-gray-400 dark:text-gray-600">レッスン一覧を読み込み中...</div>
    </div>
  ),
});
```

## 確認事項

- `SectionLessonList`: Client Component（`"use client"`あり）→ 動的インポート必須
- `CourseOverview`: Server Component（`"use client"`なし）→ 念のため動的インポートに変更

## テスト手順

1. 開発サーバーを再起動：
   ```bash
   npm run dev
   ```

2. 以下のURLにアクセスして確認：
   - `/courses/course-software-architecture-basics`
   - `/courses/course-infrastructure-basics`
   - その他のコースページ

3. ブラウザのコンソールとターミナルのエラーログを確認：
   - `useState`エラーが解消されていることを確認

## 関連ファイル

- `app/courses/[courseId]/page.tsx`
- `components/courses/CourseOverview.tsx`
- `components/courses/SectionLessonList.tsx`
