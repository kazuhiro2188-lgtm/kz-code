/**
 * 学習統計サービス
 * 
 * ユーザーの学習統計データを計算・提供します。
 */

import type { Course } from "./content";
import { contentService } from "./content";
import { getAllUserUnderstandings } from "@/lib/data/lesson-understanding";
import type { UnderstandingLevel } from "@/lib/data/understanding-levels";
import { getLessonById } from "@/lib/data/courses";

/**
 * 学習統計データ
 */
export type LearningStatistics = {
  // 基本統計
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  
  // 理解度統計
  understandingDistribution: {
    level: UnderstandingLevel;
    count: number;
    percentage: number;
  }[];
  
  // コース別統計
  courseStatistics: CourseStatistic[];
  
  // 時系列統計
  dailyActivity: DailyActivity[];
  weeklyActivity: WeeklyActivity[];
  
  // 学習パターン
  learningPattern: {
    averageLessonsPerDay: number;
    mostActiveDay: string;
    longestStreak: number;
    currentStreak: number;
  };
};

/**
 * コース別統計
 */
export type CourseStatistic = {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  averageUnderstanding: number; // 0-100のスコア
  lastAccessedAt: string | null;
};

/**
 * 日次活動データ
 */
export type DailyActivity = {
  date: string;
  dateLabel: string;
  lessonsCompleted: number;
  understandingAverage: number;
};

/**
 * 週次活動データ
 */
export type WeeklyActivity = {
  weekStart: string;
  weekLabel: string;
  lessonsCompleted: number;
  understandingAverage: number;
};

/**
 * LearningStatisticsService インターフェース
 */
export interface LearningStatisticsService {
  /**
   * ユーザーの学習統計を取得
   * 
   * @param userId - ユーザーID
   * @returns 学習統計データ
   */
  getStatistics(userId: string): Promise<LearningStatistics>;
  
  /**
   * コース別統計を取得
   * 
   * @param userId - ユーザーID
   * @param courseId - コースID
   * @returns コース別統計データ
   */
  getCourseStatistics(userId: string, courseId: string): Promise<CourseStatistic | null>;
}

/**
 * LearningStatisticsService の実装
 */
class LearningStatisticsServiceImpl implements LearningStatisticsService {
  async getStatistics(userId: string): Promise<LearningStatistics> {
    // 理解度データを取得
    const understandings = getAllUserUnderstandings(userId);
    const completedLessonIds = new Set(understandings.map((u) => u.lessonId));
    
    // 全コースを取得
    const coursesResult = await contentService.listCourses();
    const courses = coursesResult.success ? coursesResult.data : [];
    
    // 全レッスン数を計算
    let totalLessons = 0;
    const courseStatistics: CourseStatistic[] = [];
    
    for (const course of courses) {
      const courseDataResult = await contentService.getCourseWithSectionsAndLessons(course.id);
      if (courseDataResult.success && courseDataResult.data) {
        const { sections } = courseDataResult.data;
        let courseTotalLessons = 0;
        let courseCompletedLessons = 0;
        let totalUnderstandingScore = 0;
        let understandingCount = 0;
        let lastAccessedAt: string | null = null;
        
        for (const section of sections) {
          courseTotalLessons += section.lessons.length;
          for (const lesson of section.lessons) {
            if (completedLessonIds.has(lesson.id)) {
              courseCompletedLessons++;
              const understanding = understandings.find((u) => u.lessonId === lesson.id);
              if (understanding) {
                const score = this.getUnderstandingScore(understanding.understandingLevel);
                totalUnderstandingScore += score;
                understandingCount++;
                
                const completedDate = new Date(understanding.completedAt);
                if (!lastAccessedAt || completedDate > new Date(lastAccessedAt)) {
                  lastAccessedAt = understanding.completedAt;
                }
              }
            }
          }
        }
        
        totalLessons += courseTotalLessons;
        
        if (courseTotalLessons > 0) {
          courseStatistics.push({
            courseId: course.id,
            courseTitle: course.title,
            totalLessons: courseTotalLessons,
            completedLessons: courseCompletedLessons,
            progressPercentage: Math.round((courseCompletedLessons / courseTotalLessons) * 100),
            averageUnderstanding: understandingCount > 0 
              ? Math.round(totalUnderstandingScore / understandingCount) 
              : 0,
            lastAccessedAt,
          });
        }
      }
    }
    
    // 理解度分布を計算
    const understandingDistribution = this.calculateUnderstandingDistribution(understandings);
    
    // 日次活動データを計算（過去30日間）
    const dailyActivity = this.calculateDailyActivity(understandings, 30);
    
    // 週次活動データを計算（過去12週間）
    const weeklyActivity = this.calculateWeeklyActivity(understandings, 12);
    
    // 学習パターンを計算
    const learningPattern = this.calculateLearningPattern(understandings);
    
    return {
      totalLessons,
      completedLessons: understandings.length,
      progressPercentage: totalLessons > 0 
        ? Math.round((understandings.length / totalLessons) * 100) 
        : 0,
      understandingDistribution,
      courseStatistics: courseStatistics.sort((a, b) => b.progressPercentage - a.progressPercentage),
      dailyActivity,
      weeklyActivity,
      learningPattern,
    };
  }
  
  async getCourseStatistics(userId: string, courseId: string): Promise<CourseStatistic | null> {
    const statistics = await this.getStatistics(userId);
    return statistics.courseStatistics.find((cs) => cs.courseId === courseId) || null;
  }
  
  /**
   * 理解度をスコアに変換（0-100）
   */
  private getUnderstandingScore(level: UnderstandingLevel): number {
    const scores: Record<UnderstandingLevel, number> = {
      excellent: 100,
      good: 75,
      fair: 50,
      poor: 25,
    };
    return scores[level];
  }
  
  /**
   * 理解度分布を計算
   */
  private calculateUnderstandingDistribution(
    understandings: Array<{ understandingLevel: UnderstandingLevel }>
  ): Array<{ level: UnderstandingLevel; count: number; percentage: number }> {
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
    if (total === 0) {
      return [];
    }
    
    const distribution: Array<{ level: UnderstandingLevel; count: number; percentage: number }> = [];
    (Object.keys(counts) as UnderstandingLevel[]).forEach((level) => {
      const count = counts[level];
      if (count > 0) {
        distribution.push({
          level,
          count,
          percentage: Math.round((count / total) * 100),
        });
      }
    });
    
    return distribution.sort((a, b) => {
      const order: UnderstandingLevel[] = ["excellent", "good", "fair", "poor"];
      return order.indexOf(a.level) - order.indexOf(b.level);
    });
  }
  
  /**
   * 日次活動データを計算
   */
  private calculateDailyActivity(
    understandings: Array<{ completedAt: string; understandingLevel: UnderstandingLevel }>,
    days: number
  ): DailyActivity[] {
    const activity: DailyActivity[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = date.toISOString().split("T")[0];
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
      
      const dayUnderstandings = understandings.filter((u) => {
        const completedDate = new Date(u.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        return completedDate.toISOString().split("T")[0] === dateStr;
      });
      
      const lessonsCompleted = dayUnderstandings.length;
      let totalScore = 0;
      dayUnderstandings.forEach((u) => {
        totalScore += this.getUnderstandingScore(u.understandingLevel);
      });
      const understandingAverage = lessonsCompleted > 0 
        ? Math.round(totalScore / lessonsCompleted) 
        : 0;
      
      activity.push({
        date: dateStr,
        dateLabel: `${month}/${day}(${dayOfWeek})`,
        lessonsCompleted,
        understandingAverage,
      });
    }
    
    return activity;
  }
  
  /**
   * 週次活動データを計算
   */
  private calculateWeeklyActivity(
    understandings: Array<{ completedAt: string; understandingLevel: UnderstandingLevel }>,
    weeks: number
  ): WeeklyActivity[] {
    const activity: WeeklyActivity[] = [];
    const today = new Date();
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekStartStr = weekStart.toISOString().split("T")[0];
      const month = weekStart.getMonth() + 1;
      const day = weekStart.getDate();
      const weekLabel = `${month}/${day}週`;
      
      const weekUnderstandings = understandings.filter((u) => {
        const completedDate = new Date(u.completedAt);
        return completedDate >= weekStart && completedDate <= weekEnd;
      });
      
      const lessonsCompleted = weekUnderstandings.length;
      let totalScore = 0;
      weekUnderstandings.forEach((u) => {
        totalScore += this.getUnderstandingScore(u.understandingLevel);
      });
      const understandingAverage = lessonsCompleted > 0 
        ? Math.round(totalScore / lessonsCompleted) 
        : 0;
      
      activity.push({
        weekStart: weekStartStr,
        weekLabel,
        lessonsCompleted,
        understandingAverage,
      });
    }
    
    return activity;
  }
  
  /**
   * 学習パターンを計算
   */
  private calculateLearningPattern(
    understandings: Array<{ completedAt: string }>
  ): {
    averageLessonsPerDay: number;
    mostActiveDay: string;
    longestStreak: number;
    currentStreak: number;
  } {
    if (understandings.length === 0) {
      return {
        averageLessonsPerDay: 0,
        mostActiveDay: "なし",
        longestStreak: 0,
        currentStreak: 0,
      };
    }
    
    // 日別の完了数をカウント
    const dailyCounts: Record<string, number> = {};
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    const dayCounts: Record<string, number> = {
      日: 0,
      月: 0,
      火: 0,
      水: 0,
      木: 0,
      金: 0,
      土: 0,
    };
    
    understandings.forEach((u) => {
      const date = new Date(u.completedAt);
      const dateStr = date.toISOString().split("T")[0];
      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
      
      const dayName = dayNames[date.getDay()];
      dayCounts[dayName]++;
    });
    
    // 平均レッスン数/日
    const uniqueDays = Object.keys(dailyCounts).length;
    const averageLessonsPerDay = uniqueDays > 0 
      ? Math.round((understandings.length / uniqueDays) * 100) / 100 
      : 0;
    
    // 最も活動的な曜日
    const mostActiveDay = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "なし";
    
    // 連続学習日数を計算
    const sortedDates = Object.keys(dailyCounts)
      .map((d) => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());
    
    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const diffDays = Math.floor(
        (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // 現在の連続学習日数を計算
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let checkDate = new Date(today);
    let streakCount = 0;
    
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (dailyCounts[dateStr]) {
        streakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    currentStreak = streakCount;
    
    return {
      averageLessonsPerDay,
      mostActiveDay,
      longestStreak,
      currentStreak,
    };
  }
}

export const learningStatisticsService = new LearningStatisticsServiceImpl();
