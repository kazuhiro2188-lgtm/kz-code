import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { contentService } from "@/lib/services/content";
import { progressService } from "@/lib/services/progress";
import { mdxSerializer } from "@/lib/mdx/serializer";
import MDXRenderer from "@/components/mdx/MDXRenderer";
import CompleteLessonButton from "./CompleteLessonButton";
import ChatUI from "@/components/chat/ChatUI";
import { FadeIn, SlideUp } from "@/components/animations/PageTransition";

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
      title: "レッスンが見つかりません - KZ-Code",
    };
  }

  return {
    title: `${lessonResult.data.title} - KZ-Code`,
  };
}

/**
 * レッスンページ
 * 
 * Server Component として実装され、レッスンコンテンツを表示します。
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { courseId, sectionId, lessonId } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

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

  // レッスンの完了ステータスを取得
  const statusResult = await progressService.getLessonStatus(user.id, lessonId);
  const isCompleted = statusResult.success && statusResult.data.completed;

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 md:py-8 px-4 sm:px-6 lg:px-8">
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
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {lesson.title}
            </h1>
          </div>
        </FadeIn>

        {/* MDX コンテンツ */}
        <SlideUp delay={0.1}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <MDXRenderer source={serializedMDX} isDark={false} />
          </div>
        </SlideUp>

        {/* レッスン完了ボタン */}
        <SlideUp delay={0.2}>
          <CompleteLessonButton lessonId={lessonId} isCompleted={isCompleted} />
        </SlideUp>

        {/* AI チャット UI */}
        <SlideUp delay={0.3}>
          <div className="mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              AI アシスタント
            </h2>
            <div className="h-[400px] sm:h-[500px] md:h-[600px]">
              <ChatUI lessonId={lessonId} />
            </div>
          </div>
        </SlideUp>
      </div>
    </div>
  );
}
