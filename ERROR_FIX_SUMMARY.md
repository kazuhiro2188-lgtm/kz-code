# useStateエラー修正サマリー

## 問題

`Cannot read properties of null (reading 'useState')` エラーが発生していました。

## 原因

Server ComponentからClient Component（`FadeIn`、`SlideUp`など）を直接インポートしていたため、Reactコンテキストが正しく設定されていませんでした。

## 修正内容

### 1. DashboardWrapperコンポーネントの作成

`components/dashboard/DashboardWrapper.tsx`を作成し、`FadeInWrapper`と`SlideUpWrapper`を提供するClient Componentとして実装しました。

### 2. 動的インポートへの変更

以下のページで、Client Componentを動的インポートに変更しました：

- ✅ `app/dashboard/page.tsx`
  - `FadeIn` → `FadeInWrapper` (動的インポート)
  - `SlideUp` → `SlideUpWrapper` (動的インポート)
  - `ProgressCharts` → 動的インポート
  - `RecommendedReviewLessons` → 動的インポート
  - `LearningPathSuggestions` → 動的インポート

- ✅ `app/statistics/page.tsx`
  - `FadeIn` → `FadeInWrapper` (動的インポート)
  - `LearningStatisticsView` → 動的インポート

- ✅ `app/courses/[courseId]/sections/[sectionId]/lessons/[lessonId]/page.tsx`
  - `FadeIn` → `FadeInWrapper` (動的インポート)
  - `SlideUp` → `SlideUpWrapper` (動的インポート)

- ✅ `app/login/page.tsx`
  - `FadeIn` → `FadeInWrapper` (動的インポート)
  - `SlideUp` → `SlideUpWrapper` (動的インポート)

- ✅ `app/signup/page.tsx`
  - `FadeIn` → `FadeInWrapper` (動的インポート)
  - `SlideUp` → `SlideUpWrapper` (動的インポート)

- ✅ `app/onboarding/page.tsx`
  - `FadeIn` → `FadeInWrapper` (動的インポート)
  - `SlideUp` → `SlideUpWrapper` (動的インポート)

### 3. 動的インポートのパターン

```typescript
const FadeInWrapper = dynamic(
  () => import("@/components/dashboard/DashboardWrapper").then((mod) => mod.FadeInWrapper),
  { ssr: false }
);

const SlideUpWrapper = dynamic(
  () => import("@/components/dashboard/DashboardWrapper").then((mod) => mod.SlideUpWrapper),
  { ssr: false }
);
```

## 動作確認

開発サーバーを再起動して、エラーが解消されたか確認してください：

```bash
npm run dev
```

ブラウザで以下を確認：
1. `/dashboard` - エラーなく表示される
2. `/statistics` - エラーなく表示される
3. `/courses/.../lessons/...` - エラーなく表示される

## 注意事項

- `ssr: false`を設定することで、これらのコンポーネントはクライアントサイドでのみレンダリングされます
- アニメーションはクライアントサイドでのみ動作します
- 初回ロード時にアニメーションが表示されない場合があります（これは正常な動作です）
