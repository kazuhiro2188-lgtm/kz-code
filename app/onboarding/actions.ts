"use server";

import { userProfileService } from "@/lib/services/user-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * オンボーディング完了 Server Action
 * 
 * @param learningGoal - 学習目標
 * @param experienceLevel - 経験レベル
 * @returns エラーメッセージ（成功時は null）
 */
export async function completeOnboardingAction(
  learningGoal: string,
  experienceLevel: string
): Promise<{ error: string | null }> {
  // 現在のユーザーを取得
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "認証が必要です" };
  }

  const result = await userProfileService.completeOnboarding(user.id, {
    learning_goal: learningGoal,
    experience_level: experienceLevel,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  // 成功時はダッシュボードへリダイレクト
  redirect("/dashboard");
}
