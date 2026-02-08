"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6 sm:p-8">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            このコースにはまだセクションが登録されていません。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.id} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {section.title}
              </h2>
            </div>

            {section.lessons.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                このセクションにはまだレッスンが登録されていません。
              </p>
            ) : (
              <div className="space-y-3">
                {section.lessons.map((lesson) => {
                  const status = lessonStatuses.get(lesson.id);
                  const isCompleted = status?.completed || false;

                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{
                        y: -4,
                        scale: 1.01,
                        transition: {
                          duration: 0.2,
                          ease: "easeOut",
                        },
                      }}
                      whileTap={{ scale: 0.98 }}
                      style={{ willChange: "transform" }}
                    >
                      <Link
                        href={`/courses/${courseId}/sections/${section.id}/lessons/${lesson.id}`}
                        className="group/lesson block relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
                        aria-label={`${lesson.title}レッスンを開く${isCompleted ? "（完了済み）" : ""}`}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover/lesson:from-blue-500/10 group-hover/lesson:via-purple-500/10 group-hover/lesson:to-pink-500/10 dark:group-hover/lesson:from-blue-500/5 dark:group-hover/lesson:via-purple-500/5 dark:group-hover/lesson:to-pink-500/5 rounded-xl"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                        <div className="relative flex items-center justify-between p-3 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            {/* 完了ステータスアイコン */}
                            {isCompleted ? (
                              <motion.div
                                className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md"
                                whileHover={{
                                  scale: 1.15,
                                  rotate: [0, -10, 10, -10, 0],
                                  transition: { duration: 0.4 },
                                }}
                                style={{ willChange: "transform" }}
                              >
                                <svg
                                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                              </motion.div>
                            ) : (
                              <motion.div
                                className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50"
                                whileHover={{
                                  scale: 1.1,
                                  borderColor: "rgb(59, 130, 246)",
                                  transition: { duration: 0.2 },
                                }}
                                style={{ willChange: "transform" }}
                              />
                            )}

                            {/* レッスンタイトル */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white group-hover/lesson:text-blue-600 dark:group-hover/lesson:text-blue-400 transition-colors duration-300 line-clamp-2">
                                {lesson.title}
                              </h3>
                              {isCompleted && status?.completedAt && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  完了日: {new Date(status.completedAt).toLocaleDateString("ja-JP")}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* 矢印アイコン */}
                          <motion.svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2 sm:ml-4 group-hover/lesson:text-blue-500 dark:group-hover/lesson:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            whileHover={{
                              x: 4,
                              transition: { duration: 0.2 },
                            }}
                            style={{ willChange: "transform" }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </motion.svg>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
