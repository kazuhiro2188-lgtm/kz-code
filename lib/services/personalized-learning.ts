/**
 * パーソナライズド学習サービス
 * 
 * 理解度に基づく復習推奨、学習パス提案などの機能を提供します。
 */

import type { Lesson } from "./content";
import { contentService } from "./content";
import { getLessonById } from "@/lib/data/courses";
import {
  getRecommendedReviewLessonIds,
  getAllUserUnderstandings,
  type LessonUnderstanding,
} from "@/lib/data/lesson-understanding";
import { shouldRecommendReview } from "@/lib/data/understanding-levels";
import type { UnderstandingLevel } from "@/lib/data/understanding-levels";

/**
 * 復習推奨レッスン
 */
export type RecommendedReviewLesson = {
  lesson: Lesson;
  understandingLevel: UnderstandingLevel;
  completedAt: string;
  reason: string;
};

/**
 * 学習パス提案
 */
export type LearningPathSuggestion = {
  courseId: string;
  courseTitle: string;
  sectionId: string;
  nextLessonId: string;
  nextLessonTitle: string;
  reason: string;
};

/**
 * PersonalizedLearningService インターフェース
 */
export interface PersonalizedLearningService {
  /**
   * 復習推奨レッスンを取得
   * 
   * @param userId - ユーザーID
   * @param limit - 取得件数の上限（デフォルト: 5）
   * @returns 復習推奨レッスンのリスト
   */
  getRecommendedReviewLessons(
    userId: string,
    limit?: number
  ): Promise<RecommendedReviewLesson[]>;

  /**
   * 学習パスを提案
   * 
   * @param userId - ユーザーID
   * @returns 学習パス提案のリスト
   */
  getLearningPathSuggestions(
    userId: string
  ): Promise<LearningPathSuggestion[]>;
}

/**
 * PersonalizedLearningService の実装
 */
class PersonalizedLearningServiceImpl implements PersonalizedLearningService {
  async getRecommendedReviewLessons(
    userId: string,
    limit: number = 5
  ): Promise<RecommendedReviewLesson[]> {
    // 復習推奨レッスンIDを取得
    const recommendedLessonIds = getRecommendedReviewLessonIds(userId);
    
    if (recommendedLessonIds.length === 0) {
      return [];
    }

    // 理解度データを取得
    const allUnderstandings = getAllUserUnderstandings(userId);
    const understandingMap = new Map<string, LessonUnderstanding>();
    for (const understanding of allUnderstandings) {
      if (recommendedLessonIds.includes(understanding.lessonId)) {
        understandingMap.set(understanding.lessonId, understanding);
      }
    }

    // レッスン情報を取得
    const recommendedLessons: RecommendedReviewLesson[] = [];
    
    for (const lessonId of recommendedLessonIds.slice(0, limit)) {
      const understanding = understandingMap.get(lessonId);
      if (!understanding) continue;

      // 静的データからレッスン情報を取得
      const lesson = getLessonById(lessonId);
      if (!lesson) continue;

      // 復習推奨理由を生成
      const reason = this.generateReviewReason(understanding.understandingLevel);

      recommendedLessons.push({
        lesson,
        understandingLevel: understanding.understandingLevel,
        completedAt: understanding.completedAt,
        reason,
      });
    }

    // 完了日時でソート（最近完了したものから）
    return recommendedLessons.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }

  async getLearningPathSuggestions(
    userId: string
  ): Promise<LearningPathSuggestion[]> {
    const coursesResult = await contentService.listCourses();
    if (!coursesResult.success) {
      return [];
    }

    const suggestions: LearningPathSuggestion[] = [];
    const { getAllUserUnderstandings } = await import("@/lib/data/lesson-understanding");
    const userUnderstandings = getAllUserUnderstandings(userId);
    const completedLessonIds = new Set(userUnderstandings.map((u) => u.lessonId));
    const understandingMap = new Map(
      userUnderstandings.map((u) => [u.lessonId, u.understandingLevel])
    );

    // コースを順序通りに処理
    const sortedCourses = coursesResult.data.sort((a, b) => a.orderIndex - b.orderIndex);

    for (const course of sortedCourses) {
      const sectionsResult = await contentService.getCourseWithSectionsAndLessons(course.id);
      if (!sectionsResult.success || !sectionsResult.data) continue;

      const { sections } = sectionsResult.data;
      
      // コース内の次のレッスンを探す
      let nextLesson: Lesson | null = null;
      let reason = "";

      // セクションとレッスンを順番に確認
      for (const section of sections) {
        const sortedLessons = section.lessons.sort((a: Lesson, b: Lesson) => a.orderIndex - b.orderIndex);
        
        for (let i = 0; i < sortedLessons.length; i++) {
          const lesson = sortedLessons[i];
          
          // 未完了のレッスンが見つかった場合
          if (!completedLessonIds.has(lesson.id)) {
            nextLesson = lesson;
            
            // 前のレッスンが完了しているか確認
            if (i > 0) {
              const prevLesson = sortedLessons[i - 1];
              const prevUnderstanding = understandingMap.get(prevLesson.id);
              
              if (prevUnderstanding === "excellent" || prevUnderstanding === "good") {
                reason = "前のレッスンをよく理解できたので、次のレッスンに進みましょう";
              } else {
                reason = "このコースの次のレッスンです";
              }
            } else {
              // セクションの最初のレッスン
              if (section.orderIndex === 1) {
                reason = "このコースの最初のレッスンから始めましょう";
              } else {
                reason = "このセクションの最初のレッスンです";
              }
            }
            break;
          }
        }
        
        if (nextLesson) break;
      }

      // 次のレッスンが見つかった場合、提案に追加
      if (nextLesson) {
        // セクションIDを取得
        const sectionId = nextLesson.sectionId;
        
        suggestions.push({
          courseId: course.id,
          courseTitle: course.title,
          sectionId: sectionId,
          nextLessonId: nextLesson.id,
          nextLessonTitle: nextLesson.title,
          reason: reason || "次のレッスンに進みましょう",
        });
      }
    }

    // 最大3件を返す
    return suggestions.slice(0, 3);
  }

  /**
   * 復習推奨理由を生成
   */
  private generateReviewReason(level: UnderstandingLevel): string {
    switch (level) {
      case "fair":
        return "基本的な内容は理解できましたが、詳細が不明確です。復習をおすすめします。";
      case "poor":
        return "内容が難しく、もう一度学習する必要があります。";
      default:
        return "復習をおすすめします。";
    }
  }
}

/**
 * PersonalizedLearningService のシングルトンインスタンス
 */
export const personalizedLearningService = new PersonalizedLearningServiceImpl();
