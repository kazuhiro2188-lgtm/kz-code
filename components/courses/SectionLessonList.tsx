import Link from "next/link";
import type { Section, Lesson } from "@/lib/services/content";
import type { LessonStatus } from "@/lib/services/progress";

/**
 * SectionLessonList コンポーネントの Props
 */
type SectionLessonListProps = {
  courseId: string;
  sections: Array<Section & { lessons: Lesson[] }>;
  lessonStatuses: Map<string, LessonStatus>;
};

/**
 * セクション・レッスン一覧コンポーネント
 * 
 * コースのセクションとレッスンを階層構造で表示し、各レッスンの完了/未完了ステータスを表示します。
 */
export default function SectionLessonList({
  courseId,
  sections,
  lessonStatuses,
}: SectionLessonListProps) {
  if (sections.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400 text-center">
          このコースにはまだセクションが登録されていません。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div
          key={section.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {section.title}
          </h2>

          {section.lessons.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              このセクションにはまだレッスンが登録されていません。
            </p>
          ) : (
            <div className="space-y-2">
              {section.lessons.map((lesson) => {
                const status = lessonStatuses.get(lesson.id);
                const isCompleted = status?.completed || false;

                return (
                  <Link
                    key={lesson.id}
                    href={`/courses/${courseId}/sections/${section.id}/lessons/${lesson.id}`}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* 完了ステータスアイコン */}
                      {isCompleted ? (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                      )}

                      {/* レッスンタイトル */}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {lesson.title}
                        </h3>
                        {isCompleted && status.completedAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            完了日: {new Date(status.completedAt).toLocaleDateString("ja-JP")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 矢印アイコン */}
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
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
