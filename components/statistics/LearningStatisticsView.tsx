"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { LearningStatistics } from "@/lib/services/learning-statistics";
import { FadeIn, SlideUp } from "@/components/animations/PageTransition";

interface LearningStatisticsViewProps {
  statistics: LearningStatistics;
}

/**
 * 学習統計ビューコンポーネント
 * 
 * 詳細な学習統計を表示します。
 */
export default function LearningStatisticsView({ statistics }: LearningStatisticsViewProps) {
  const understandingLevelLabels: Record<string, string> = {
    excellent: "完璧",
    good: "良好",
    fair: "普通",
    poor: "要復習",
  };

  const understandingLevelColors: Record<string, string> = {
    excellent: "#10b981", // green-500
    good: "#3b82f6", // blue-500
    fair: "#f59e0b", // amber-500
    poor: "#ef4444", // red-500
  };

  // 週間活動の最大値を計算
  const maxWeeklyLessons = Math.max(...statistics.weeklyActivity.map((w) => w.lessonsCompleted), 1);
  const maxDailyLessons = Math.max(...statistics.dailyActivity.map((d) => d.lessonsCompleted), 1);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 基本統計サマリー */}
      <SlideUp delay={0.1}>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-3xl blur-3xl" />
          <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              基本統計
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">総レッスン数</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statistics.totalLessons}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">完了レッスン数</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.completedLessons}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">進捗率</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statistics.progressPercentage}%</div>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/20 rounded-xl p-4 border border-pink-200/50 dark:border-pink-700/50">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">平均理解度</div>
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {statistics.courseStatistics.length > 0
                    ? Math.round(
                        statistics.courseStatistics.reduce((sum, cs) => sum + cs.averageUnderstanding, 0) /
                          statistics.courseStatistics.length
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>
      </SlideUp>

      {/* 学習パターン */}
      <SlideUp delay={0.2}>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-600/10 to-teal-600/10 dark:from-green-500/5 dark:via-emerald-500/5 dark:to-teal-500/5 rounded-3xl blur-3xl" />
          <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              学習パターン
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">1日あたりの平均レッスン数</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {statistics.learningPattern.averageLessonsPerDay.toFixed(1)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">最も活動的な曜日</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {statistics.learningPattern.mostActiveDay}曜日
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">最長連続学習日数</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {statistics.learningPattern.longestStreak}日
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">現在の連続学習日数</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {statistics.learningPattern.currentStreak}日
                </div>
              </div>
            </div>
          </div>
        </div>
      </SlideUp>

      {/* 週間活動チャート */}
      {statistics.weeklyActivity.length > 0 && (
        <SlideUp delay={0.3}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-3xl blur-3xl" />
            <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
                週間活動（過去12週間）
              </h2>
              <div className="flex items-end justify-between gap-2 sm:gap-4 h-64 overflow-x-auto pb-4">
                {statistics.weeklyActivity.map((week, index) => {
                  const height = maxWeeklyLessons > 0 
                    ? (week.lessonsCompleted / maxWeeklyLessons) * 100 
                    : 0;
                  
                  return (
                    <motion.div
                      key={week.weekStart}
                      className="flex-1 flex flex-col items-center min-w-[60px]"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="relative w-full flex items-end justify-center mb-2" style={{ height: "200px" }}>
                        <motion.div
                          className="w-full bg-gradient-to-t from-blue-500 to-purple-400 rounded-t-lg shadow-lg hover:shadow-xl transition-shadow"
                          style={{ height: `${height}%` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: index * 0.05 + 0.3, duration: 0.6, ease: "easeOut" }}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {week.lessonsCompleted}
                          </div>
                        </motion.div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                        {week.weekLabel}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </SlideUp>
      )}

      {/* コース別詳細統計 */}
      {statistics.courseStatistics.length > 0 && (
        <SlideUp delay={0.4}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-red-600/10 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-red-500/5 rounded-3xl blur-3xl" />
            <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
                コース別詳細統計
              </h2>
              <div className="space-y-4">
                {statistics.courseStatistics.map((course, index) => (
                  <motion.div
                    key={course.courseId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={`/courses/${course.courseId}`}
                      className="block p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-200 hover:shadow-lg group"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2">
                            {course.courseTitle}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">進捗率</div>
                              <div className="font-bold text-gray-900 dark:text-white">{course.progressPercentage}%</div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">完了数</div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {course.completedLessons} / {course.totalLessons}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">平均理解度</div>
                              <div className="font-bold text-gray-900 dark:text-white">{course.averageUnderstanding}%</div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">最終アクセス</div>
                              <div className="font-bold text-gray-900 dark:text-white text-xs">
                                {course.lastAccessedAt
                                  ? new Date(course.lastAccessedAt).toLocaleDateString("ja-JP", {
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "なし"}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
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
                      <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progressPercentage}%` }}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </SlideUp>
      )}
    </div>
  );
}
