/**
 * レッスン理解度データ管理
 * 
 * 認証が無効化されているため、メモリ内で理解度を管理します。
 * 将来的に認証が再有効化された場合は、データベースに移行します。
 */

import type { UnderstandingLevel } from "./understanding-levels";
import { shouldRecommendReview } from "./understanding-levels";

/**
 * レッスン理解度の記録
 */
export type LessonUnderstanding = {
  userId: string;
  lessonId: string;
  understandingLevel: UnderstandingLevel;
  completedAt: string;
};

/**
 * メモリ内の理解度データストア
 * キー: `${userId}:${lessonId}`
 */
const understandingStore = new Map<string, LessonUnderstanding>();

/**
 * レッスンの理解度を保存
 */
export function saveLessonUnderstanding(
  userId: string,
  lessonId: string,
  understandingLevel: UnderstandingLevel
): void {
  const key = `${userId}:${lessonId}`;
  understandingStore.set(key, {
    userId,
    lessonId,
    understandingLevel,
    completedAt: new Date().toISOString(),
  });
}

/**
 * レッスンの理解度を取得
 */
export function getLessonUnderstanding(
  userId: string,
  lessonId: string
): LessonUnderstanding | null {
  const key = `${userId}:${lessonId}`;
  return understandingStore.get(key) || null;
}

/**
 * ユーザーの復習推奨レッスンIDを取得
 */
export function getRecommendedReviewLessonIds(userId: string): string[] {
  const recommendedLessonIds: string[] = [];
  
  for (const [key, understanding] of understandingStore.entries()) {
    if (key.startsWith(`${userId}:`)) {
      if (shouldRecommendReview(understanding.understandingLevel)) {
        recommendedLessonIds.push(understanding.lessonId);
      }
    }
  }
  
  return recommendedLessonIds;
}

/**
 * ユーザーの全理解度データを取得
 */
export function getAllUserUnderstandings(userId: string): LessonUnderstanding[] {
  const understandings: LessonUnderstanding[] = [];
  
  for (const [key, understanding] of understandingStore.entries()) {
    if (key.startsWith(`${userId}:`)) {
      understandings.push(understanding);
    }
  }
  
  return understandings.sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

/**
 * 理解度データをクリア（テスト用）
 */
export function clearUnderstandingData(): void {
  understandingStore.clear();
}
