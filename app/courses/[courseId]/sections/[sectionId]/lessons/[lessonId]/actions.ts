"use server";

import { progressService } from "@/lib/services/progress";
// 認証無効化により、Supabaseクライアントは使用していない
import type { UnderstandingLevel } from "@/lib/data/understanding-levels";
import { saveLessonUnderstanding } from "@/lib/data/lesson-understanding";

/**
 * レッスン完了 Server Action
 * 
 * @param lessonId - レッスンID
 * @param understandingLevel - 理解度レベル（オプション）
 * @returns エラーメッセージ（成功時は null）
 */
export async function completeLessonAction(
  lessonId: string,
  understandingLevel?: UnderstandingLevel
): Promise<{ error: string | null }> {
  // 認証を無効化 - ダミーユーザーIDを使用
  const dummyUserId = "00000000-0000-0000-0000-000000000000";
  
  try {
    // 理解度レベルが指定されている場合は保存
    if (understandingLevel) {
      saveLessonUnderstanding(dummyUserId, lessonId, understandingLevel);
      console.log(`[CompleteLesson] Lesson ${lessonId} completed with understanding level: ${understandingLevel}`);
    }
    
    return { error: null };
  } catch (error) {
    console.error("[CompleteLesson] Error:", error);
    return { error: "レッスン完了の処理に失敗しました" };
  }
}
