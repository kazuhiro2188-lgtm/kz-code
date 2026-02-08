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
  title: "ダッシュボード",
  description: "学習進捗と推奨コンテンツを確認しましょう。完了率、学習時間、完了レッスン数を一目で確認できます。",
  robots: {
    index: false,
    follow: false,
  },
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
  // 認証を無効化 - ダミーユーザーIDを使用
  const dummyUserId = "00000000-0000-0000-0000-000000000000";
  const currentUser = { id: dummyUserId };

  // 進捗サマリーを取得（認証無効時は空のサマリー）
  const progressResult = { success: true as const, data: { totalLessons: 0, completedLessons: 0, progressPercentage: 0, totalLearningTime: 0, recentActivity: [] } };

  // コース一覧を取得
  const coursesResult = await contentService.listCourses();
  if (!coursesResult.success) {
    console.error("コース一覧の取得に失敗:", coursesResult.error);
  }

  // 推奨レッスンを取得（認証無効時は空の配列）
  const recommendedResult = { success: true as const, data: [] as never[] };

  const summary = progressResult.data;

  const courses = coursesResult.success ? coursesResult.data : [];
  const recommendedLessons = recommendedResult.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-4 sm:py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* ヘッダー */}
        <FadeIn>
          <header className="relative" role="banner">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-3xl blur-3xl" />
            <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg" aria-hidden="true">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-2">
                    ダッシュボード
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
                    学習進捗と推奨コンテンツを確認しましょう
                  </p>
                </div>
              </div>
            </div>
          </header>
        </FadeIn>

        {/* コース一覧 - 一番上に配置 */}
        <SlideUp delay={0.1}>
          <CourseList courses={courses} userId={currentUser.id} />
        </SlideUp>

        {/* 進捗サマリー */}
        <SlideUp delay={0.2}>
          <ProgressSummaryCard summary={summary} />
        </SlideUp>

        {/* 推奨コンテンツ */}
        <SlideUp delay={0.3}>
          <RecommendedLessons lessons={recommendedLessons} />
        </SlideUp>
      </div>
    </div>
  );
}
