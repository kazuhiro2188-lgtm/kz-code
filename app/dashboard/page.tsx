import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { progressService } from "@/lib/services/progress";
import { contentService } from "@/lib/services/content";
import ProgressSummaryCard from "@/components/dashboard/ProgressSummary";
import RecommendedLessons from "@/components/dashboard/RecommendedLessons";
import CourseList from "@/components/dashboard/CourseList";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/animations/PageTransition";

export const metadata: Metadata = {
  title: "ダッシュボード - KZ-Code",
  description: "学習進捗と推奨コンテンツを確認しましょう",
};

// ISR: コース一覧などのメタデータを60秒間キャッシュ
// 注: ユーザー固有の進捗データはキャッシュされません
export const revalidate = 60;

/**
 * ダッシュボードページ
 * 
 * Server Component として実装され、進捗サマリー、推奨レッスン、コース一覧を表示します。
 */
export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未認証ユーザーはログインページへリダイレクト
  if (!user) {
    redirect("/login");
  }

  // プロフィールが存在しない場合は自動作成（オンボーディング完了済みとして）
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!existingProfile) {
    // プロフィールが存在しない場合は作成（オンボーディング完了済みとして）
    const { error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        onboarding_completed: true,
      });

    if (createError && createError.code !== "23505") {
      // 23505 は重複エラー（既に作成されている場合）
      console.error("プロフィール作成エラー:", createError);
    }
  } else if (!existingProfile.onboarding_completed) {
    // オンボーディング未完了の場合はオンボーディングページへリダイレクト
    redirect("/onboarding");
  }

  // 進捗サマリーを取得
  const progressResult = await progressService.getProgressSummary(user.id);
  if (!progressResult.success) {
    // エラー時は空のサマリーを表示
    console.error("進捗サマリーの取得に失敗:", progressResult.error);
  }

  // コース一覧を取得
  const coursesResult = await contentService.listCourses();
  if (!coursesResult.success) {
    console.error("コース一覧の取得に失敗:", coursesResult.error);
  }

  // 推奨レッスンを取得
  const recommendedResult = await contentService.getRecommendedLessons(
    user.id
  );
  if (!recommendedResult.success) {
    console.error("推奨レッスンの取得に失敗:", recommendedResult.error);
  }

  const summary = progressResult.success ? progressResult.data : {
    totalLessons: 0,
    completedLessons: 0,
    progressPercentage: 0,
    totalLearningTime: 0,
    recentActivity: [],
  };

  const courses = coursesResult.success ? coursesResult.data : [];
  const recommendedLessons = recommendedResult.success
    ? recommendedResult.data
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* ヘッダー */}
        <FadeIn>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              ダッシュボード
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              学習進捗と推奨コンテンツを確認しましょう
            </p>
          </div>
        </FadeIn>

        {/* 進捗サマリー */}
        <SlideUp delay={0.1}>
          <ProgressSummaryCard summary={summary} />
        </SlideUp>

        {/* 推奨コンテンツとコース一覧 */}
        <StaggerContainer>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <StaggerItem>
              <RecommendedLessons lessons={recommendedLessons} />
            </StaggerItem>
            <StaggerItem>
              <CourseList courses={courses} userId={user.id} />
            </StaggerItem>
          </div>
        </StaggerContainer>
      </div>
    </div>
  );
}
