"use client";

import Link from "next/link";
import type { LearningPathSuggestion } from "@/lib/services/personalized-learning";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/PageTransition";

interface LearningPathSuggestionsProps {
  suggestions: LearningPathSuggestion[];
}

/**
 * 学習パス提案コンポーネント
 */
export default function LearningPathSuggestions({
  suggestions,
}: LearningPathSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <FadeIn>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-600/10 to-teal-600/10 dark:from-green-500/5 dark:via-emerald-500/5 dark:to-teal-500/5 rounded-3xl blur-3xl" />
        <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg" aria-hidden="true">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                おすすめの学習パス
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                あなたの学習状況に基づいた推奨レッスン
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={`${suggestion.courseId}-${suggestion.nextLessonId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/courses/${suggestion.courseId}/sections/${suggestion.sectionId || ''}/lessons/${suggestion.nextLessonId}`}
                  className="block p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-600 transition-all duration-200 hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📖</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {suggestion.courseTitle}
                        </h3>
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {suggestion.nextLessonTitle}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {suggestion.reason}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
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
