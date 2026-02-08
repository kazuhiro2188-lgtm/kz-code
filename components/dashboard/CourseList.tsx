import Link from "next/link";
import type { Course } from "@/lib/services/content";
import { progressService } from "@/lib/services/progress";

/**
 * CourseList コンポーネントの Props
 */
type CourseListProps = {
  courses: Course[];
  userId: string;
};

/**
 * コース一覧コンポーネント
 * 
 * コース一覧とそれぞれの進捗状況を表示します。
 */
export default async function CourseList({ courses, userId }: CourseListProps) {
  // 各コースの進捗率を取得
  const coursesWithProgress = await Promise.all(
    courses.map(async (course) => {
      const progressResult = await progressService.calculateProgress(
        userId,
        course.id
      );
      return {
        ...course,
        progress: progressResult.success ? progressResult.data : 0,
      };
    })
  );

  if (coursesWithProgress.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          コース一覧
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          コースがまだ登録されていません。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        コース一覧
      </h2>

      <div className="space-y-4">
        {coursesWithProgress.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="block p-5 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {course.description}
                  </p>
                )}
              </div>
              <svg
                className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-4"
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
            </div>

            {/* 進捗バー */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>進捗</span>
                <span>{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
