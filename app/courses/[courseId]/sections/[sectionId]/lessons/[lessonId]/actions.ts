"use server";

import { progressService } from "@/lib/services/progress";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * レッスン完了 Server Action
 * 
 * @param lessonId - レッスンID
 * @returns エラーメッセージ（成功時は null）
 */
export async function completeLessonAction(
  lessonId: string
): Promise<{ error: string | null }> {
  // 現在のユーザーを取得
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "認証が必要です" };
  }

  const result = await progressService.completeLesson(user.id, lessonId);

  if (!result.success) {
    return { error: result.error.message };
  }

  return { error: null };
}
