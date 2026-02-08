"use client";

import Link from "next/link";
import type { RecommendedReviewLesson } from "@/lib/services/personalized-learning";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/PageTransition";

interface RecommendedReviewLessonsProps {
  lessons: RecommendedReviewLesson[];
}

/**
 * 復習推奨レッスンコンポーネント
 */
export default function RecommendedReviewLessons({
  lessons,
}: RecommendedReviewLessonsProps) {
  if (lessons.length === 0) {
    return null;
  }

  return (
    <FadeIn>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-red-600/10 to-pink-600/10 dark:from-orange-500/5 dark:via-red-500/5 dark:to-pink-500/5 rounded-3xl blur-3xl" />
        <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg" aria-hidden="true">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                復習推奨レッスン
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                理解度が低いレッスンを復習しましょう
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {lessons.map((item, index) => (
              <motion.div
                key={item.lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/courses/${item.lesson.courseId}/sections/${item.lesson.sectionId}/lessons/${item.lesson.id}`}
                  className="block p-4 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-200 hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {item.understandingLevel === "fair" ? "🤔" : "📚"}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {item.lesson.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.reason}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span>
                          完了日: {new Date(item.completedAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
