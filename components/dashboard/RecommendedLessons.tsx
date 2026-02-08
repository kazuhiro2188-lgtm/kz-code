"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
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
 * 推奨レッスンアイテムコンポーネント（メモ化）
 */
const RecommendedLessonItem = memo(({ lesson, index }: { lesson: Lesson; index: number }) => {
  return (
    <motion.div
      key={lesson.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: {
          duration: 0.2,
          ease: "easeOut",
        },
      }}
      whileTap={{ scale: 0.98 }}
      style={{ willChange: "transform" }}
    >
      <Link
        href={`/courses/${lesson.courseId}/sections/${lesson.sectionId}/lessons/${lesson.id}`}
        className="group/lesson block relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
        aria-label={`${lesson.title}レッスンを開く`}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover/lesson:from-blue-500/10 group-hover/lesson:via-purple-500/10 group-hover/lesson:to-pink-500/10 dark:group-hover/lesson:from-blue-500/5 dark:group-hover/lesson:via-purple-500/5 dark:group-hover/lesson:to-pink-500/5 rounded-xl"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="relative p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
                whileHover={{
                  scale: 1.15,
                  rotate: [0, -5, 5, -5, 0],
                  transition: { duration: 0.4 },
                }}
                style={{ willChange: "transform" }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover/lesson:text-blue-600 dark:group-hover/lesson:text-blue-400 transition-colors duration-300 line-clamp-2">
                  {lesson.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  コース ID: {lesson.courseId.substring(0, 8)}...
                </p>
              </div>
            </div>
            <motion.svg
              className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 group-hover/lesson:text-blue-500 dark:group-hover/lesson:text-blue-400"
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
        </div>
      </Link>
    </motion.div>
  );
});

RecommendedLessonItem.displayName = "RecommendedLessonItem";

/**
 * 推奨コンテンツカードコンポーネント
 * 
 * ユーザーの進捗に基づいて推奨されるレッスンを表示します。
 */
function RecommendedLessons({ lessons }: RecommendedLessonsProps) {
  const emptyState = useMemo(() => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-500/10 dark:to-teal-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            推奨コンテンツ
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🎉</span>
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            すべてのレッスンを完了しました！
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            素晴らしい成果です！
          </p>
        </div>
      </div>
    </div>
  ), []);

  const lessonItems = useMemo(() => (
    lessons.map((lesson, index) => (
      <RecommendedLessonItem key={lesson.id} lesson={lesson} index={index} />
    ))
  ), [lessons]);
  if (lessons.length === 0) {
    return emptyState;
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            推奨コンテンツ
          </h2>
        </div>

        <div className="space-y-3">
          {lessonItems}
        </div>
      </div>
    </div>
  );
}

export default memo(RecommendedLessons);
