"use client";

import Link from "next/link";
import type { Lesson } from "@/lib/services/content";
import { AnimatedCard } from "@/components/animations/InteractiveElements";
import { motion } from "framer-motion";

/**
 * RecommendedLessons コンポーネントの Props
 */
type RecommendedLessonsProps = {
  lessons: Lesson[];
};

/**
 * 推奨コンテンツカードコンポーネント
 * 
 * ユーザーの進捗に基づいて推奨されるレッスンを表示します。
 */
export default function RecommendedLessons({ lessons }: RecommendedLessonsProps) {
  if (lessons.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          推奨コンテンツ
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          すべてのレッスンを完了しました！🎉
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        推奨コンテンツ
      </h2>

      <div className="space-y-4">
        {lessons.map((lesson, index) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Link
              href={`/courses/${lesson.courseId}/sections/${lesson.sectionId}/lessons/${lesson.id}`}
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    コース ID: {lesson.courseId.substring(0, 8)}...
                  </p>
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
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
