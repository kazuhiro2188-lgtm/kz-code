"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/PageTransition";
import type { Course } from "@/lib/services/content";
import { getAllUserUnderstandings } from "@/lib/data/lesson-understanding";
import type { UnderstandingLevel } from "@/lib/data/understanding-levels";

/**
 * コース別進捗データ
 */
type CourseProgressData = {
  courseId: string;
  courseTitle: string;
  completed: number;
  total: number;
  percentage: number;
};

/**
 * 週間学習データ
 */
type WeeklyLearningData = {
  date: string;
  dateLabel: string;
  lessonsCompleted: number;
};

/**
 * 理解度分布データ
 */
type UnderstandingDistribution = {
  level: UnderstandingLevel;
  label: string;
  count: number;
  percentage: number;
  color: string;
};

interface ProgressChartsProps {
  userId: string;
  courses: Course[];
  courseProgressMap?: Map<string, { completed: number; total: number }>;
}

/**
 * 進捗チャートコンポーネント
 * 
 * コース別進捗、週間学習活動、理解度分布を可視化します。
 */
export default function ProgressCharts({ userId, courses, courseProgressMap }: ProgressChartsProps) {
  // 理解度データを取得
  const understandings = getAllUserUnderstandings(userId);
  const completedLessonIds = new Set(understandings.map((u) => u.lessonId));

  // コース別進捗データを計算
  const courseProgressData = useMemo(() => {
    const data: CourseProgressData[] = [];

    for (const course of courses) {
      const progress = courseProgressMap?.get(course.id);
      const totalLessons = progress?.total || 0;
      const completedLessons = progress?.completed || 0;

      if (totalLessons > 0) {
        data.push({
          courseId: course.id,
          courseTitle: course.title,
          completed: completedLessons,
          total: totalLessons,
          percentage: Math.round((completedLessons / totalLessons) * 100),
        });
      }
    }

    return data.sort((a, b) => b.percentage - a.percentage);
  }, [courses, courseProgressMap]);

  // 週間学習データを計算（過去7日間）
  const weeklyLearningData = useMemo(() => {
    const data: WeeklyLearningData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dateStr = date.toISOString().split("T")[0];
      const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      // その日の完了レッスン数をカウント
      const lessonsCompleted = understandings.filter((u) => {
        const completedDate = new Date(u.completedAt).toISOString().split("T")[0];
        return completedDate === dateStr;
      }).length;

      data.push({
        date: dateStr,
        dateLabel: `${month}/${day}(${dayOfWeek})`,
        lessonsCompleted,
      });
    }

    return data;
  }, [understandings]);

  // 理解度分布データを計算
  const understandingDistribution = useMemo(() => {
    const levelMap: Record<UnderstandingLevel, { label: string; color: string }> = {
      excellent: { label: "完璧", color: "#10b981" }, // green-500
      good: { label: "良好", color: "#3b82f6" }, // blue-500
      fair: { label: "普通", color: "#f59e0b" }, // amber-500
      poor: { label: "要復習", color: "#ef4444" }, // red-500
    };

    const counts: Record<UnderstandingLevel, number> = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
    };

    understandings.forEach((u) => {
      counts[u.understandingLevel]++;
    });

    const total = understandings.length;
    const distribution: UnderstandingDistribution[] = [];

    if (total > 0) {
      (Object.keys(counts) as UnderstandingLevel[]).forEach((level) => {
        const count = counts[level];
        if (count > 0) {
          distribution.push({
            level,
            label: levelMap[level].label,
            count,
            percentage: Math.round((count / total) * 100),
            color: levelMap[level].color,
          });
        }
      });
    }

    return distribution.sort((a, b) => {
      const order: UnderstandingLevel[] = ["excellent", "good", "fair", "poor"];
      return order.indexOf(a.level) - order.indexOf(b.level);
    });
  }, [understandings]);

  const maxWeeklyLessons = Math.max(...weeklyLearningData.map((d) => d.lessonsCompleted), 1);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* コース別進捗バーチャート */}
      {courseProgressData.length > 0 && (
        <FadeIn>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-3xl blur-3xl" />
            <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    コース別進捗
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                    各コースの完了率を確認
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {courseProgressData.map((item, index) => (
                  <motion.div
                    key={item.courseId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                          {item.courseTitle}
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.completed} / {item.total} レッスン
                      </div>
                    </div>
                    <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* 週間学習活動 */}
      {weeklyLearningData.length > 0 && (
        <FadeIn>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-600/10 to-teal-600/10 dark:from-green-500/5 dark:via-emerald-500/5 dark:to-teal-500/5 rounded-3xl blur-3xl" />
            <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    週間学習活動
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                    過去7日間の学習状況
                  </p>
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 sm:gap-4 h-48">
                {weeklyLearningData.map((item, index) => {
                  const height = maxWeeklyLessons > 0 
                    ? (item.lessonsCompleted / maxWeeklyLessons) * 100 
                    : 0;
                  
                  return (
                    <motion.div
                      key={item.date}
                      className="flex-1 flex flex-col items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="relative w-full flex items-end justify-center mb-2" style={{ height: "160px" }}>
                        <motion.div
                          className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg shadow-lg hover:shadow-xl transition-shadow"
                          style={{ height: `${height}%` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.6, ease: "easeOut" }}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {item.lessonsCompleted}
                          </div>
                        </motion.div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                        <div className="font-semibold">{item.dateLabel.split("(")[0]}</div>
                        <div className="text-[10px]">{item.dateLabel.split("(")[1]?.replace(")", "")}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* 理解度分布 */}
      {understandingDistribution.length > 0 && (
        <FadeIn>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-red-600/10 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-red-500/5 rounded-3xl blur-3xl" />
            <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    理解度分布
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                    レッスン完了時の理解度の分布
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {understandingDistribution.map((item, index) => {
                  const circumference = 2 * Math.PI * 40;
                  const offset = circumference - (item.percentage / 100) * circumference;

                  return (
                    <motion.div
                      key={item.level}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <svg className="transform -rotate-90 w-20 h-20">
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                          />
                          <motion.circle
                            cx="40"
                            cy="40"
                            r="35"
                            stroke={item.color}
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold" style={{ color: item.color }}>
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.count} レッスン
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
