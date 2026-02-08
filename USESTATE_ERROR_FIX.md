# useStateエラー修正

## 問題
`TypeError: Cannot read properties of null (reading 'useState')`エラーが発生していました。

## 原因
`CompleteLessonButton`がClient Component（`"use client"`ディレクティブあり）なのに、Server Componentから直接インポートされていました。

## 修正内容

### 1. CompleteLessonButtonの動的インポート
`app/courses/[courseId]/sections/[sectionId]/lessons/[lessonId]/page.tsx`を修正：

```typescript
// 修正前
import CompleteLessonButton from "./CompleteLessonButton";

// 修正後
const CompleteLessonButton = dynamic(() => import("./CompleteLessonButton"), {
  loading: () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-pulse text-gray-400 dark:text-gray-600">ボタンを読み込み中...</div>
    </div>
  ),
});
```

### 2. PlaceholderContentの動的インポート（念のため）
`PlaceholderContent`はServer Componentですが、一貫性のために動的インポートに変更：

```typescript
const PlaceholderContent = dynamic(() => import("@/components/lessons/PlaceholderContent"));
```

### 3. MDXSerializerの改善
自己閉じタグ（`<br/>`など）を修正する処理を追加：

```typescript
private fixSelfClosingTags(source: string): string {
  // コードブロック内は除外
  const codeBlockRegex = /```[\s\S]*?```/g;
  const protectedAreas: Array<{ marker: string; content: string }> = [];
  let markerIndex = 0;

  // コードブロックを保護
  source = source.replace(codeBlockRegex, (match) => {
    const marker = `__PROTECTED_CODE_${markerIndex}__`;
    protectedAreas.push({ marker, content: match });
    markerIndex++;
    return marker;
  });

  // 自己閉じタグを修正（<br/> → <br>）
  let result = source.replace(/<br\s*\/>/gi, "<br>");

  // 保護した領域を復元
  for (const area of protectedAreas) {
    result = result.replace(area.marker, area.content);
  }

  return result;
}
```

## テスト手順

1. 開発サーバーを再起動：
   ```bash
   npm run dev
   ```

2. 以下のURLにアクセスして確認：
   - `/courses/course-infrastructure-basics/sections/section-infrastructure-fundamentals/lessons/lesson-container-basics`
   - `/courses/course-infrastructure-basics/sections/section-infrastructure-fundamentals/lessons/lesson-infrastructure-overview`
   - `/courses/course-infrastructure-basics/sections/section-infrastructure-fundamentals/lessons/lesson-infrastructure-ai-development`

3. ブラウザのコンソールとターミナルのエラーログを確認：
   - `useState`エラーが解消されていることを確認
   - MDXシリアライズエラーが解消されていることを確認

## 関連ファイル

- `app/courses/[courseId]/sections/[sectionId]/lessons/[lessonId]/page.tsx`
- `lib/mdx/serializer.ts`
- `app/courses/[courseId]/sections/[sectionId]/lessons/[lessonId]/CompleteLessonButton.tsx`
