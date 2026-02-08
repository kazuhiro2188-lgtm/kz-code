import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { contentService } from "@/lib/services/content";
import { progressService, type LessonStatus } from "@/lib/services/progress";
import CourseOverview from "@/components/courses/CourseOverview";
import SectionLessonList from "@/components/courses/SectionLessonList";
import Link from "next/link";

type CoursePageProps = {
  params: Promise<{ courseId: string }>;
};

// ISR: 60秒間キャッシュ
export const revalidate = 60;

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { courseId } = await params;
  const courseResult = await contentService.getCourse(courseId);

  if (!courseResult.success || !courseResult.data) {
    return {
      title: "コースが見つかりません - KZ-Code",
    };
  }

  return {
    title: `${courseResult.data.title} - KZ-Code`,
    description: courseResult.data.description || undefined,
  };
}

/**
 * コース詳細ページ
 * 
 * Server Component として実装され、コース情報、セクション・レッスン一覧、各レッスンの完了ステータスを表示します。
 */
export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  
  // 認証が無効化されている場合はダミーユーザーIDを使用
  const isAuthDisabled = process.env.DISABLE_AUTH === "true";
  const dummyUserId = "00000000-0000-0000-0000-000000000000";

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 認証が無効化されている場合はダミーユーザーを使用
  const currentUser = isAuthDisabled ? { id: dummyUserId } : (user || { id: dummyUserId });

  if (!isAuthDisabled && !user) {
    notFound();
  }

  // コース情報とセクション・レッスン一覧を取得
  const courseDataResult = await contentService.getCourseWithSectionsAndLessons(
    courseId
  );

  if (!courseDataResult.success || !courseDataResult.data) {
    notFound();
  }

  const { course, sections } = courseDataResult.data;

  // すべてのレッスンIDを取得
  const allLessonIds = sections.flatMap((section) =>
    section.lessons.map((lesson) => lesson.id)
  );

  // 各レッスンの完了ステータスを取得（認証無効時は空のマップ）
  const lessonStatuses = new Map<string, LessonStatus>();
  if (!isAuthDisabled) {
    await Promise.all(
      allLessonIds.map(async (lessonId) => {
        const statusResult = await progressService.getLessonStatus(
          currentUser.id,
          lessonId
        );
        if (statusResult.success) {
          lessonStatuses.set(lessonId, statusResult.data);
        }
      })
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* 戻るリンク */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
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
          <span>ダッシュボードに戻る</span>
        </Link>

        {/* コース概要 */}
        <CourseOverview course={course} />

        {/* セクション・レッスン一覧 */}
        <SectionLessonList
          courseId={courseId}
          sections={sections}
          lessonStatuses={lessonStatuses}
        />
      </div>
    </div>
  );
}
