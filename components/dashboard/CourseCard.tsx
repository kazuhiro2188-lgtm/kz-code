"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Course } from "@/lib/services/content";

type CourseCardProps = {
  course: Course & { progress: number };
};

/**
 * コースカードコンポーネント（Client Component）
 * 
 * Framer Motionを使用したホバーアニメーション付きのコースカードです。
 */
export default function CourseCard({ course }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        y: -8,
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
        href={`/courses/${course.id}`}
        className="group/course block relative overflow-hidden h-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-xl"
        aria-label={`${course.title}コースを開く。進捗: ${course.progress}%`}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover/course:from-indigo-500/10 group-hover/course:via-purple-500/10 group-hover/course:to-pink-500/10 dark:group-hover/course:from-indigo-500/5 dark:group-hover/course:via-purple-500/5 dark:group-hover/course:to-pink-500/5 rounded-xl"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="relative h-full p-4 sm:p-5 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:border-indigo-400/50 dark:hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex flex-col">
          {/* アイコンとタイトル */}
          <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
            <motion.div
              className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
              whileHover={{
                scale: 1.15,
                rotate: [0, -5, 5, -5, 0],
                transition: { duration: 0.4 },
              }}
              style={{ willChange: "transform" }}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover/course:text-indigo-600 dark:group-hover/course:text-indigo-400 transition-colors duration-300 line-clamp-2">
                {course.title}
              </h3>
              {course.description && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {course.description}
                </p>
              )}
            </div>
          </div>

          {/* 進捗バー - 下部に配置 */}
          <div className="mt-auto pt-3 sm:pt-4">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                進捗
              </span>
              <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">{course.progress}%</span>
            </div>
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5 overflow-hidden shadow-inner">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-md"
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>

          {/* 矢印アイコン - 右上に配置 */}
          <motion.svg
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 group-hover/course:text-indigo-500 dark:group-hover/course:text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            whileHover={{
              x: 4,
              y: -4,
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
}
