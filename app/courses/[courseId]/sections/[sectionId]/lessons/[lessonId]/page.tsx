import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { contentService } from "@/lib/services/content";
import { progressService } from "@/lib/services/progress";
import { mdxSerializer } from "@/lib/mdx/serializer";
import CompleteLessonButton from "./CompleteLessonButton";
import { FadeIn, SlideUp } from "@/components/animations/PageTransition";

// 動的インポートによるコード分割と遅延読み込み
const MDXRenderer = dynamic(() => import("@/components/mdx/MDXRenderer"), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-pulse text-gray-400 dark:text-gray-600">コンテンツを読み込み中...</div>
    </div>
  ),
});

// ChatUIはClient Componentなので、Client Componentラッパーで動的インポート
const ChatUI = dynamic(() => import("@/components/chat/ChatUI"), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-gray-400 dark:text-gray-600">チャットを読み込み中...</div>
    </div>
  ),
});

type LessonPageProps = {
  params: Promise<{
    courseId: string;
    sectionId: string;
    lessonId: string;
  }>;
};

// ISR: 60秒間キャッシュ
export const revalidate = 60;

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { courseId, sectionId, lessonId } = await params;
  const lessonResult = await contentService.getLesson(
    courseId,
    sectionId,
    lessonId
  );

  if (!lessonResult.success || !lessonResult.data) {
    return {
      title: "レッスンが見つかりません",
    };
  }

  const lesson = lessonResult.data;
  return {
    title: lesson.title,
    description: `AI駆動開発のレッスン: ${lesson.title}`,
    openGraph: {
      title: lesson.title,
      description: `AI駆動開発のレッスン: ${lesson.title}`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: lesson.title,
      description: `AI駆動開発のレッスン: ${lesson.title}`,
    },
  };
}

/**
 * レッスンページ
 * 
 * Server Component として実装され、レッスンコンテンツを表示します。
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { courseId, sectionId, lessonId } = await params;
  
  // 認証を無効化 - ダミーユーザーIDを使用
  const dummyUserId = "00000000-0000-0000-0000-000000000000";
  const currentUser = { id: dummyUserId };

  // レッスンメタデータを取得
  const lessonResult = await contentService.getLesson(
    courseId,
    sectionId,
    lessonId
  );

  if (!lessonResult.success || !lessonResult.data) {
    notFound();
  }

  const lesson = lessonResult.data;

  // レッスンコンテンツを取得
  const contentResult = await contentService.getLessonContent(lessonId);

  if (!contentResult.success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-700 dark:text-red-400">
              レッスンコンテンツの読み込みに失敗しました: {contentResult.error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // MDX をシリアライズ
  const serializedMDX = await mdxSerializer.serialize(contentResult.data);

  // レッスンの完了ステータスを取得（認証無効時は未完了として扱う）
  const statusResult = { success: true as const, data: { lessonId, completed: false, completedAt: null } };
  const isCompleted = false;

  // 前後レッスンを取得するため、セクション内のレッスン一覧を取得
  const courseDataResult = await contentService.getCourseWithSectionsAndLessons(
    courseId
  );

  let prevLesson: { courseId: string; sectionId: string; lessonId: string } | null = null;
  let nextLesson: { courseId: string; sectionId: string; lessonId: string } | null = null;

  if (courseDataResult.success && courseDataResult.data) {
    const { sections } = courseDataResult.data;
    const currentSection = sections.find((s) => s.id === sectionId);
    
    if (currentSection) {
      const currentIndex = currentSection.lessons.findIndex(
        (l) => l.id === lessonId
      );

      if (currentIndex > 0) {
        // 前のレッスン
        const prev = currentSection.lessons[currentIndex - 1];
        prevLesson = {
          courseId,
          sectionId,
          lessonId: prev.id,
        };
      } else {
        // 前のセクションの最後のレッスンを探す
        const currentSectionIndex = sections.findIndex(
          (s) => s.id === sectionId
        );
        if (currentSectionIndex > 0) {
          const prevSection = sections[currentSectionIndex - 1];
          if (prevSection.lessons.length > 0) {
            const prev = prevSection.lessons[prevSection.lessons.length - 1];
            prevLesson = {
              courseId,
              sectionId: prevSection.id,
              lessonId: prev.id,
            };
          }
        }
      }

      if (currentIndex < currentSection.lessons.length - 1) {
        // 次のレッスン
        const next = currentSection.lessons[currentIndex + 1];
        nextLesson = {
          courseId,
          sectionId,
          lessonId: next.id,
        };
      } else {
        // 次のセクションの最初のレッスンを探す
        const currentSectionIndex = sections.findIndex(
          (s) => s.id === sectionId
        );
        if (currentSectionIndex < sections.length - 1) {
          const nextSection = sections[currentSectionIndex + 1];
          if (nextSection.lessons.length > 0) {
            const next = nextSection.lessons[0];
            nextLesson = {
              courseId,
              sectionId: nextSection.id,
              lessonId: next.id,
            };
          }
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-4 sm:py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ナビゲーションバー */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>コースに戻る</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {prevLesson && (
              <Link
                href={`/courses/${prevLesson.courseId}/sections/${prevLesson.sectionId}/lessons/${prevLesson.lessonId}`}
                className="inline-flex items-center gap-1 sm:gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-sm sm:text-base"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden sm:inline">前のレッスン</span>
                <span className="sm:hidden">前へ</span>
              </Link>
            )}

            {nextLesson && (
              <Link
                href={`/courses/${nextLesson.courseId}/sections/${nextLesson.sectionId}/lessons/${nextLesson.lessonId}`}
                className="inline-flex items-center gap-1 sm:gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-sm sm:text-base"
              >
                <span className="hidden sm:inline">次のレッスン</span>
                <span className="sm:hidden">次へ</span>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* レッスンタイトル */}
        <FadeIn>
          <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-3xl blur-3xl" />
            <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                {lesson.title}
              </h1>
            </div>
          </div>
        </FadeIn>

        {/* MDX コンテンツ */}
        <SlideUp delay={0.1}>
          <div className="relative group mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8">
              <MDXRenderer source={serializedMDX} isDark={false} />
            </div>
          </div>
        </SlideUp>

        {/* レッスン完了ボタン */}
        <SlideUp delay={0.2}>
          <CompleteLessonButton lessonId={lessonId} isCompleted={isCompleted} />
        </SlideUp>

        {/* AI チャット UI */}
        <SlideUp delay={0.3}>
          <div className="relative group mt-6 sm:mt-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  AI アシスタント
                </h2>
              </div>
              <div className="h-[400px] sm:h-[500px] md:h-[600px]">
                <ChatUI lessonId={lessonId} />
              </div>
            </div>
          </div>
        </SlideUp>
      </div>
    </div>
  );
}
